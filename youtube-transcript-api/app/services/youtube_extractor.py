"""YouTube video / channel / playlist information extraction via yt-dlp."""

from __future__ import annotations

import logging
import os
from yt_dlp import YoutubeDL

logger = logging.getLogger(__name__)


class ExtractionError(Exception):
    """Raised when yt-dlp fails to extract video information."""


class YouTubeExtractor:
    """Wraps yt-dlp to extract video metadata from YouTube URLs."""

    # Chrome cookies handle bot-detection; default web client is most reliable.
    _BASE_OPTS = {
        "quiet": True,
        "no_warnings": True,
        "ignoreerrors": True,
        "extract_flat": False,
        "skip_download": True,
        "no_check_formats": True,
    }

    def __init__(self):
        # Prefer Chrome cookies on macOS (more likely to be fresh).
        # Falls back to cookies.txt, then iOS client impersonation.
        self._cookies_from_browser = None
        self._cookiefile = None

        # 1) Try Chrome cookies on macOS first (always fresher than cookies.txt)
        if os.uname().sysname == "Darwin":
            try:
                import subprocess
                subprocess.run(
                    ["python3", "-m", "yt_dlp", "--cookies-from-browser", "chrome", "--version"],
                    capture_output=True, timeout=5,
                )
                self._cookies_from_browser = "chrome"
                logger.info("Using Chrome cookies for yt-dlp")
                return
            except Exception:
                logger.debug("Chrome cookies unavailable")

        # 2) Fall back to cookies.txt file
        cookie_file = os.path.join(os.path.dirname(__file__), "..", "..", "cookies.txt")
        cookie_file = os.path.abspath(cookie_file)
        if os.path.isfile(cookie_file):
            self._cookiefile = cookie_file
            logger.info("Using cookies.txt for yt-dlp: %s", cookie_file)
            return

        logger.info("No cookies available; using iOS client impersonation")

    def extract_video_list(
        self, source_url: str, source_type: str, max_videos: int
    ) -> list[dict]:
        """Extract a list of video metadata dicts from a channel, playlist, or single video.

        Args:
            source_url: Normalised YouTube URL.
            source_type: One of 'channel', 'playlist', 'video'.
            max_videos: Maximum number of videos to return.

        Returns:
            List of dicts with keys: video_id, title, url, channel, channel_url,
            upload_date, duration, description, thumbnail.

        Raises:
            ExtractionError: When yt-dlp cannot extract any videos.
        """
        if source_type == "video":
            detail = self.extract_video_detail(source_url)
            return [detail] if detail else []

        opts = {**self._BASE_OPTS, "extract_flat": "in_playlist"}
        self._add_cookies(opts)
        try:
            with YoutubeDL(opts) as ydl:
                info = ydl.extract_info(source_url, download=False)
        except Exception as exc:
            logger.error("yt-dlp extract_info failed for %s: %s", source_url, exc)
            raise ExtractionError(f"视频列表获取失败: {exc}") from exc

        if not info:
            raise ExtractionError("视频列表获取失败: 无返回数据")

        entries = info.get("entries") or []
        videos = []
        for entry in entries:
            if entry is None:
                continue
            videos.append(self._parse_entry(entry, source_type))
            if len(videos) >= max_videos:
                break

        if not videos:
            raise ExtractionError("视频列表为空，请检查链接是否正确。")

        logger.info("Extracted %d videos from %s", len(videos), source_url)
        return videos

    def _add_cookies(self, opts: dict) -> None:
        """Add cookie options to yt-dlp opts dict."""
        if self._cookiefile:
            opts["cookiefile"] = self._cookiefile
        elif self._cookies_from_browser:
            opts["cookiesfrombrowser"] = (self._cookies_from_browser,)

    def extract_video_detail(self, video_url: str) -> dict | None:
        """Extract detailed metadata for a single video URL.

        Falls back to flat extraction when format-related errors occur
        (e.g. bot detection blocking the player response).
        """
        opts = {**self._BASE_OPTS}
        self._add_cookies(opts)
        try:
            with YoutubeDL(opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
        except Exception as exc:
            err_msg = str(exc)
            if "Sign in to confirm" in err_msg or "no formats" in err_msg.lower():
                logger.warning(
                    "Format extraction blocked for %s, retrying with extract_flat: %s",
                    video_url, err_msg[:120],
                )
                return self._extract_flat_fallback(video_url)
            logger.error("yt-dlp detail extraction failed for %s: %s", video_url, exc)
            raise ExtractionError(f"视频详情获取失败: {exc}") from exc

        if not info:
            logger.warning(
                "Full extraction returned nothing for %s, trying flat fallback", video_url
            )
            return self._extract_flat_fallback(video_url)

        return self._parse_entry(info, "video")

    def _extract_flat_fallback(self, video_url: str) -> dict | None:
        """Last-resort extraction that skips player response → no formats, minimal metadata."""
        opts = {
            "quiet": True,
            "no_warnings": True,
            "ignoreerrors": True,
            "extract_flat": True,
            "skip_download": True,
        }
        self._add_cookies(opts)
        try:
            with YoutubeDL(opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
        except Exception as exc:
            logger.error("Flat fallback also failed for %s: %s", video_url, exc)
            raise ExtractionError(f"视频详情获取失败（flat fallback）: {exc}") from exc

        if not info:
            return None
        return self._parse_entry(info, "video")

    # ------------------------------------------------------------------
    def _parse_entry(self, entry: dict, source_type: str) -> dict:
        """Normalise a yt-dlp info dict / flat entry into our canonical format."""
        video_id = entry.get("id", "")
        title = entry.get("title") or ""

        # URL
        url = entry.get("webpage_url") or entry.get("url") or ""
        if not url and video_id:
            url = f"https://www.youtube.com/watch?v={video_id}"

        # Channel
        channel = entry.get("channel") or entry.get("uploader") or ""
        channel_url = entry.get("channel_url") or entry.get("uploader_url") or ""

        # Upload date: yt-dlp gives YYYYMMDD → normalise to YYYY-MM-DD
        upload_date = entry.get("upload_date") or ""
        if len(upload_date) == 8:
            upload_date = f"{upload_date[:4]}-{upload_date[4:6]}-{upload_date[6:8]}"

        # Duration: may be None or float
        duration = entry.get("duration")
        if duration is not None:
            duration = int(duration)
        else:
            duration = 0

        description = entry.get("description") or ""
        thumbnail = entry.get("thumbnail") or ""

        return {
            "video_id": video_id,
            "title": title,
            "url": url,
            "channel": channel,
            "channel_url": channel_url,
            "upload_date": upload_date,
            "duration": duration,
            "description": description,
            "thumbnail": thumbnail,
        }
