"""
REDDIT-FLOW-NODE — FastAPI Backend
=====================================
Endpoints:
  GET  /health
  POST /auth/reddit
  GET  /mock/trending/{subreddit}
  POST /refine/prompt
  POST /execute/blueprint

The active Reddit client (mock or real) is selected at startup
based on the USE_MOCK_REDDIT environment variable.
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

# --- Internal modules ---
from core.agent_refiner import AgentRefiner

# Lazy import of Reddit client based on mode
USE_MOCK = os.environ.get("USE_MOCK_REDDIT", "true").lower() in ("true", "1", "yes")

if USE_MOCK:
    from core.mock_reddit_client import MockRedditManager as _RedditClient
else:
    from core.reddit_client import RedditManager as _RedditClient  # type: ignore

# -----------------------------------------------------------------------
# App lifecycle — instantiate singletons at startup
# -----------------------------------------------------------------------

reddit_manager: Optional[_RedditClient] = None
agent_refiner: Optional[AgentRefiner] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global reddit_manager, agent_refiner
    reddit_manager = _RedditClient()
    agent_refiner = AgentRefiner()
    mode = "MOCK" if USE_MOCK else "LIVE"
    ai_mode = "MOCK AI" if agent_refiner._use_mock else "LIVE AI (LiteLLM)"
    print(f"[RFN] Reddit mode: {mode} | AI mode: {ai_mode}")
    yield
    # Cleanup (nothing needed currently)


# -----------------------------------------------------------------------
# FastAPI App
# -----------------------------------------------------------------------

cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

app = FastAPI(
    title="REDDIT-FLOW-NODE API",
    description="Node-based Reddit automation with AI prompt refinement.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------
# Request / Response Models
# -----------------------------------------------------------------------

class RefinePromptRequest(BaseModel):
    raw_idea: str = Field(..., min_length=5, description="The raw idea to refine.")
    iterations: int = Field(default=1, ge=1, le=3, description="Critique-revise cycles.")


class BlueprintNode(BaseModel):
    id: str
    type: str  # "reddit_source" | "prompt_refiner" | "human_approval" | "publisher"
    data: dict


class ExecuteBlueprintRequest(BaseModel):
    nodes: list[BlueprintNode]
    subreddit: Optional[str] = "SideProject"
    keyword: Optional[str] = ""
    auto_approve: bool = False


class PostContentRequest(BaseModel):
    subreddit: str
    title: str
    text: str
    flair: Optional[str] = None


# -----------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------

@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "ok",
        "version": "2.0.0",
        "reddit_mode": "mock" if USE_MOCK else "live",
        "ai_mode": "mock" if (agent_refiner and agent_refiner._use_mock) else "live",
    }


@app.post("/auth/reddit", tags=["Reddit"])
async def auth_reddit():
    """Authenticate with Reddit (uses mock if USE_MOCK_REDDIT=true)."""
    try:
        result = reddit_manager.authenticate_user()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/mock/trending/{subreddit}", tags=["Reddit"])
async def get_trending(subreddit: str, limit: int = 10):
    """Fetch (mock or live) trending posts from the given subreddit."""
    try:
        posts = reddit_manager.get_trending(subreddit=subreddit, limit=limit)
        return {"subreddit": subreddit, "posts": posts, "count": len(posts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/refine/prompt", tags=["AI"])
async def refine_prompt(body: RefinePromptRequest):
    """
    Run the 3-pass recursive refinement loop on the raw idea.
    Returns proposed blueprint, critic review, and final synthesis.
    """
    try:
        result = agent_refiner.refine(
            raw_idea=body.raw_idea,
            max_iterations=body.iterations,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/execute/blueprint", tags=["Pipeline"])
async def execute_blueprint(body: ExecuteBlueprintRequest):
    """
    Run the full node pipeline:
      RedditSource → PromptRefiner → (HumanApproval) → Publisher
    Set auto_approve=true to skip the human-approval gate in testing.
    """
    pipeline_log = []

    # --- Step 1: Reddit Source Node ---
    source_node = next(
        (n for n in body.nodes if n.type == "reddit_source"), None
    )
    subreddit = body.subreddit or "all"
    keyword = body.keyword or ""

    posts = reddit_manager.get_trending(subreddit=subreddit, limit=5)
    pipeline_log.append({
        "node": "reddit_source",
        "status": "completed",
        "output": {"posts_fetched": len(posts), "subreddit": subreddit},
    })

    # --- Step 2: Prompt Refiner Node ---
    raw_idea = keyword or (posts[0]["title"] if posts else "AI automation for Reddit growth")
    refinement = agent_refiner.refine(raw_idea=raw_idea, max_iterations=1)
    pipeline_log.append({
        "node": "prompt_refiner",
        "status": "completed",
        "output": {"mode": refinement["mode"], "duration_seconds": refinement["duration_seconds"]},
    })

    # --- Step 3: Human Approval Gate ---
    approval_node = next(
        (n for n in body.nodes if n.type == "human_approval"), None
    )
    approved = body.auto_approve or (
        approval_node is not None and approval_node.data.get("approved", False)
    )

    pipeline_log.append({
        "node": "human_approval",
        "status": "approved" if approved else "pending",
        "output": {"approved": approved},
    })

    if not approved:
        return {
            "status": "awaiting_approval",
            "pipeline": pipeline_log,
            "blueprint": refinement["final"],
            "message": "Set 'auto_approve: true' or mark the Human Approval node as approved.",
        }

    # --- Step 4: Publisher Node ---
    publish_node = next(
        (n for n in body.nodes if n.type == "publisher"), None
    )
    title = refinement["final"].split("\n")[0].replace("## ", "").replace("# ", "").strip()
    if not title:
        title = f"Automated post: {raw_idea}"

    publish_result = reddit_manager.post_content(
        subreddit=subreddit,
        title=title[:300],  # Reddit title limit
        text=refinement["final"],
    )
    pipeline_log.append({
        "node": "publisher",
        "status": "completed",
        "output": publish_result,
    })

    return {
        "status": "completed",
        "pipeline": pipeline_log,
        "blueprint": refinement["final"],
        "publish_result": publish_result,
    }


# -----------------------------------------------------------------------
# Dev entry point
# -----------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
