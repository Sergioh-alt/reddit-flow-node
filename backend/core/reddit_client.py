"""
REDDIT-FLOW-NODE — Real Reddit Client (PRAW)
=============================================
Used when USE_MOCK_REDDIT=false in .env.
Implements OAuth2 authentication and respects Reddit's rate limits.
"""

import time
import os
from typing import Optional
import praw
from praw.models import Submission


# Reddit enforces a minimum delay between writes; never go below this.
_WRITE_RATE_LIMIT_SECONDS = 2.0


class RedditManager:
    """
    Production Reddit client using PRAW with OAuth2 authentication.

    Compliance:
    - User-Agent follows Reddit's required format.
    - Write operations are throttled to respect Reddit's rate limits.
    - Read operations rely on PRAW's built-in rate-limit handler.
    """

    def __init__(self):
        self._reddit: Optional[praw.Reddit] = None
        self._last_write_time: float = 0.0

    # -------------------------------------------------------------------
    # Authentication
    # -------------------------------------------------------------------
    def authenticate_user(self) -> dict:
        """
        Authenticate using OAuth2 (script-type flow).
        Credentials are read from environment variables set in .env.
        """
        client_id = os.environ["REDDIT_CLIENT_ID"]
        client_secret = os.environ["REDDIT_CLIENT_SECRET"]
        username = os.environ["REDDIT_USERNAME"]
        password = os.environ["REDDIT_PASSWORD"]
        user_agent = os.environ.get(
            "REDDIT_USER_AGENT",
            f"web:reddit-ai-flow:v1.0 (by /u/{username})",
        )

        self._reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            username=username,
            password=password,
            user_agent=user_agent,
            # PRAW's built-in rate-limit handler will sleep automatically
            # when Reddit signals a 429 or returns Retry-After.
            ratelimit_seconds=600,
        )
        # Verify credentials by fetching identity
        me = self._reddit.user.me()
        return {
            "status": "ok",
            "mode": "live",
            "user": str(me),
            "scopes": list(self._reddit.auth.scopes()),
            "message": "Authenticated with Reddit via PRAW OAuth2.",
        }

    def _require_auth(self):
        if self._reddit is None:
            raise RuntimeError(
                "Not authenticated. Call authenticate_user() first."
            )

    # -------------------------------------------------------------------
    # Rate-limit helper for write operations
    # -------------------------------------------------------------------
    def _throttle_write(self):
        """Ensure we never submit more than one write per _WRITE_RATE_LIMIT_SECONDS."""
        elapsed = time.monotonic() - self._last_write_time
        if elapsed < _WRITE_RATE_LIMIT_SECONDS:
            time.sleep(_WRITE_RATE_LIMIT_SECONDS - elapsed)
        self._last_write_time = time.monotonic()

    # -------------------------------------------------------------------
    # Read / Trending
    # -------------------------------------------------------------------
    def get_trending(self, subreddit: str = "all", limit: int = 10) -> list[dict]:
        """Fetch the hottest posts from the given subreddit."""
        self._require_auth()
        sub = self._reddit.subreddit(subreddit)
        posts = []
        for submission in sub.hot(limit=limit):
            posts.append(self._serialize_submission(submission))
        return posts

    def search_posts(self, query: str, subreddit: str = "all", limit: int = 10) -> list[dict]:
        """Search Reddit for posts matching the query."""
        self._require_auth()
        sub = self._reddit.subreddit(subreddit)
        posts = []
        for submission in sub.search(query, limit=limit, sort="hot"):
            posts.append(self._serialize_submission(submission))
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
        """Submit a self (text) post to the given subreddit."""
        self._require_auth()
        self._throttle_write()
        sub = self._reddit.subreddit(subreddit)
        submission: Submission = sub.submit(
            title=title,
            selftext=text,
            flair_id=flair,
        )
        return {
            "status": "posted",
            "mode": "live",
            "post_id": submission.id,
            "subreddit": subreddit,
            "title": submission.title,
            "url": f"https://reddit.com{submission.permalink}",
        }

    def post_reply(self, post_id: str, body: str) -> dict:
        """Reply to an existing submission."""
        self._require_auth()
        self._throttle_write()
        submission = self._reddit.submission(id=post_id)
        comment = submission.reply(body=body)
        return {
            "status": "replied",
            "mode": "live",
            "comment_id": comment.id,
            "parent_post_id": post_id,
            "body": body,
        }

    # -------------------------------------------------------------------
    # Serialization
    # -------------------------------------------------------------------
    @staticmethod
    def _serialize_submission(submission: "Submission") -> dict:
        return {
            "id": submission.id,
            "title": submission.title,
            "author": str(submission.author) if submission.author else "[deleted]",
            "subreddit": str(submission.subreddit),
            "score": submission.score,
            "num_comments": submission.num_comments,
            "url": f"https://reddit.com{submission.permalink}",
            "created_utc": submission.created_utc,
            "selftext": submission.selftext[:500],  # Truncate for API safety
            "is_mock": False,
        }
