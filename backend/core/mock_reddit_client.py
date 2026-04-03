"""
REDDIT-FLOW-NODE — Mock Reddit Client
======================================
Used when USE_MOCK_REDDIT=true in .env.
Provides deterministic fake data so the UI and pipeline can be
tested without a real Reddit API key.
"""

import time
import random
from typing import Optional


class MockRedditManager:
    """
    Drop-in replacement for RedditManager that returns pre-built fake data.
    Simulates Reddit's rate limits with small sleep delays.
    """

    USER_AGENT = "web:reddit-ai-flow:v1.0 (by /u/MOCK_USER)"

    # --- Fake data pools ---
    _FAKE_TITLES = [
        "AI is changing how we do market research — here's what I found",
        "My six-month experiment automating Reddit engagement [results inside]",
        "Why every SaaS founder should be lurking these subreddits",
        "The hidden pattern in top-performing posts (analyzed 10K posts)",
        "I used an AI writing loop to 10x my post quality — AMA",
        "Keyword clustering technique that doubled my organic reach",
        "Unpopular opinion: most AI content still sounds robotic",
        "Weekly thread: share your best automation wins this week",
    ]

    _FAKE_AUTHORS = [
        "growth_hacker_97", "ai_explorer_sam", "reddit_maestro",
        "digital_nomad_dev", "startup_lurker", "automod_survivor",
        "marketer_in_the_wild", "prompt_wizard_42",
    ]

    _FAKE_SUBREDDITS = [
        "MachineLearning", "artificial", "ChatGPT", "Entrepreneur",
        "SideProject", "Python", "learnmachinelearning", "OpenAI",
    ]

    def __init__(self):
        self._authenticated = False
        self._post_counter = 1000

    # -------------------------------------------------------------------
    # Authentication
    # -------------------------------------------------------------------
    def authenticate_user(self) -> dict:
        """Simulate OAuth2 authentication handshake."""
        time.sleep(0.2)  # Simulate network delay
        self._authenticated = True
        return {
            "status": "ok",
            "mode": "mock",
            "user": "MOCK_USER",
            "scopes": ["read", "submit", "privatemessages"],
            "message": "Mock authentication successful — no real credentials used.",
        }

    # -------------------------------------------------------------------
    # Read / Trending
    # -------------------------------------------------------------------
    def get_trending(self, subreddit: str = "all", limit: int = 10) -> list[dict]:
        """Return a list of fake trending posts for the given subreddit."""
        time.sleep(0.1)  # Simulate rate-limit-safe delay
        posts = []
        for i in range(min(limit, 8)):
            posts.append({
                "id": f"mock_{random.randint(10000, 99999)}",
                "title": self._FAKE_TITLES[i % len(self._FAKE_TITLES)],
                "author": self._FAKE_AUTHORS[i % len(self._FAKE_AUTHORS)],
                "subreddit": subreddit or random.choice(self._FAKE_SUBREDDITS),
                "score": random.randint(50, 12000),
                "num_comments": random.randint(5, 400),
                "url": f"https://reddit.com/r/{subreddit}/comments/mock_{i}/",
                "created_utc": time.time() - random.randint(100, 86400),
                "selftext": "This is mock post content for testing purposes.",
                "is_mock": True,
            })
        return posts

    def search_posts(self, query: str, subreddit: str = "all", limit: int = 10) -> list[dict]:
        """Return fake search results matching the query."""
        posts = self.get_trending(subreddit, limit)
        # Inject the query keyword into the first result title for realism
        if posts:
            posts[0]["title"] = f"[Mock] Top result for '{query}': {posts[0]['title']}"
        return posts

    # -------------------------------------------------------------------
    # Write / Post
    # -------------------------------------------------------------------
    def post_content(
        self,
        subreddit: str,
        title: str,
        text: str,
        flair: Optional[str] = None,
    ) -> dict:
        """Simulate submitting a text post to Reddit."""
        time.sleep(0.3)  # Simulate Reddit submission delay
        self._post_counter += 1
        post_id = f"mock_{self._post_counter}"
        return {
            "status": "posted",
            "mode": "mock",
            "post_id": post_id,
            "subreddit": subreddit,
            "title": title,
            "url": f"https://reddit.com/r/{subreddit}/comments/{post_id}/",
            "message": "Mock post created — nothing was actually submitted to Reddit.",
        }

    def post_reply(self, post_id: str, body: str) -> dict:
        """Simulate replying to a Reddit post/comment."""
        time.sleep(0.2)
        comment_id = f"mock_comment_{random.randint(10000, 99999)}"
        return {
            "status": "replied",
            "mode": "mock",
            "comment_id": comment_id,
            "parent_post_id": post_id,
            "body": body,
            "message": "Mock reply created — nothing was submitted to Reddit.",
        }
