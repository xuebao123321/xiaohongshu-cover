"""Subtitle fetching via youtube-transcript-api with retry on rate limits."""

from __future__ import annotations

import logging
import os

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled
from youtube_transcript_api.proxies import ProxyConfig

logger = logging.getLogger(__name__)

# Retry config for YouTube IP rate limiting
_MAX_RETRIES = 3
_BASE_DELAY = 3.0  # seconds


def _make_http_client():
    """Create a requests.Session with Chrome cookies for YouTube auth.
    Reduces rate-limiting compared to anonymous requests."""
    try:
        import browser_cookie3
        import requests
        session = requests.Session()
        session.cookies = browser_cookie3.chrome()
        logger.debug("Chrome cookies loaded for transcript API")
        return session
    except Exception:
        logger.debug("Chrome cookies unavailable for transcript API")
        return None


def _make_proxy_config():
    """Build ProxyConfig from TRANSCRIPT_PROXY env var.
    Format: http://user:pass@host:port or just http://host:port"""
    proxy_url = os.environ.get("TRANSCRIPT_PROXY", "")
    if not proxy_url:
        return None
    return ProxyConfig(http=proxy_url, https=proxy_url)


class SubtitleService:
    """Fetch subtitles for a YouTube video via youtube-transcript-api (v1.2.x).

    Proxy support: set TRANSCRIPT_PROXY env var before starting the server.
      TRANSCRIPT_PROXY=http://user:pass@proxy.example:8080
    """

    def __init__(self, storage_dir: str):
        self._storage_dir = storage_dir  # kept for interface compatibility
        self._http_client = _make_http_client()
        self._proxy_config = _make_proxy_config()
        if self._proxy_config:
            logger.info("Transcript API using proxy")

    # ------------------------------------------------------------------
    async def fetch_subtitles(
        self,
        video_id: str,
        languages: list[str],
        subtitle_mode: str,
    ) -> dict:
        """Fetch subtitles with retry on transient failures (rate limits, etc.).

        Returns:
            {"status": "manual"|"auto"|"mixed"|"none",
             "languages": [...], "transcripts": [...]}
        """
        import asyncio
        for attempt in range(_MAX_RETRIES):
            result = await asyncio.to_thread(
                self._try_transcript_api, video_id, languages, subtitle_mode
            )
            if result["status"] != "none":
                return result

            if attempt < _MAX_RETRIES - 1:
                delay = _BASE_DELAY * (2 ** attempt)
                logger.info(
                    "Transcript API attempt %d/%d for %s failed, retrying in %.1fs",
                    attempt + 1, _MAX_RETRIES, video_id, delay,
                )
                await asyncio.sleep(delay)

        return {"status": "none", "languages": [], "transcripts": []}

    # ------------------------------------------------------------------
    def _try_transcript_api(
        self, video_id: str, languages: list[str], subtitle_mode: str
    ) -> dict:
        """Single attempt via youtube-transcript-api v1.2.x."""
        try:
            api = YouTubeTranscriptApi(
                http_client=self._http_client,
                proxy_config=self._proxy_config,
            )
            transcript_list = api.list(video_id)
        except (NoTranscriptFound, TranscriptsDisabled) as exc:
            logger.debug("No transcripts for %s: %s", video_id, exc)
            return {"status": "none", "languages": [], "transcripts": []}
        except Exception as exc:
            logger.warning("Transcript API error for %s: %s", video_id, exc)
            return {"status": "none", "languages": [], "transcripts": []}

        transcripts: list[dict] = []
        found_languages: set[str] = set()
        has_manual = False
        has_auto = False
        want_all_langs = "all" in languages

        for t in transcript_list:
            lang = t.language_code

            if not want_all_langs and lang not in languages:
                continue

            is_manual = not t.is_generated

            if subtitle_mode == "manual" and not is_manual:
                continue
            if subtitle_mode == "auto" and is_manual:
                continue

            try:
                fetched = t.fetch()
            except Exception as exc:
                logger.warning("Failed to fetch transcript %s/%s: %s", video_id, lang, exc)
                continue

            text = "\n".join(s.text for s in fetched.snippets)
            transcripts.append({
                "language": lang,
                "source": "manual" if is_manual else "auto",
                "text": text,
                "vtt_path": None,
            })
            found_languages.add(lang)
            if is_manual:
                has_manual = True
            else:
                has_auto = True

        if not transcripts:
            return {"status": "none", "languages": [], "transcripts": []}

        status = "mixed"
        if has_manual and not has_auto:
            status = "manual"
        elif has_auto and not has_manual:
            status = "auto"

        return {
            "status": status,
            "languages": sorted(found_languages),
            "transcripts": transcripts,
        }
