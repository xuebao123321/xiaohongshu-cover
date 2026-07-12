"""Whisper transcription fallback for videos without subtitles.

Downloads audio via yt-dlp, transcribes via faster-whisper (local model).
Model is downloaded on first use and cached (~150 MB for base).
"""

from __future__ import annotations

import logging
import os
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

# Model size: "tiny" fastest, "base" good balance, "small" best accuracy
# English-only models (tiny.en, base.en) are faster for English content
_DEFAULT_MODEL = "base"


def _detect_cookies():
    """Return yt-dlp cookie config."""
    cf_browser = None
    cf_file = None

    if os.uname().sysname == "Darwin":
        try:
            import subprocess
            subprocess.run(
                ["python3", "-m", "yt_dlp", "--cookies-from-browser", "chrome", "--version"],
                capture_output=True, timeout=5,
            )
            cf_browser = "chrome"
        except Exception:
            pass

    if not cf_browser:
        cookie_file = os.path.join(os.path.dirname(__file__), "..", "..", "cookies.txt")
        cookie_file = os.path.abspath(cookie_file)
        if os.path.isfile(cookie_file):
            cf_file = cookie_file

    return cf_browser, cf_file


class WhisperService:
    """Transcribe YouTube videos using local faster-whisper model."""

    def __init__(self, model_size: str = _DEFAULT_MODEL, storage_dir: str = ""):
        self._model_size = model_size
        self._model = None  # lazy load
        self._storage_dir = Path(storage_dir) if storage_dir else Path(tempfile.gettempdir())
        self._storage_dir.mkdir(parents=True, exist_ok=True)
        cf_browser, cf_file = _detect_cookies()
        self._cookies_browser = cf_browser
        self._cookiefile = cf_file

    @property
    def model(self):
        """Lazy-load the Whisper model on first use."""
        if self._model is None:
            from faster_whisper import WhisperModel
            logger.info("Loading Whisper model '%s' (first use, ~150MB download)...", self._model_size)
            self._model = WhisperModel(
                self._model_size,
                device="cpu",
                compute_type="int8",  # fast CPU inference
                num_workers=2,
            )
            logger.info("Whisper model loaded")
        return self._model

    # ------------------------------------------------------------------
    def transcribe_video(self, video_url: str) -> dict:
        """Download audio from YouTube and transcribe.

        Returns same format as SubtitleService:
            {"status": "auto", "languages": ["en"],
             "transcripts": [{"language": "en", "source": "whisper",
                              "text": "...", "vtt_path": paths}]}
        """
        audio_path = None
        try:
            audio_path = self._download_audio(video_url)
            if not audio_path:
                return {"status": "none", "languages": [], "transcripts": []}

            text, lang = self._transcribe(audio_path)
            if not text:
                return {"status": "none", "languages": [], "transcripts": []}

            # Write VTT alongside audio for compatibility
            vtt_path = self._write_vtt(audio_path, text)

            return {
                "status": "auto",
                "languages": [lang],
                "transcripts": [{
                    "language": lang,
                    "source": "whisper",
                    "text": text,
                    "vtt_path": str(vtt_path) if vtt_path else None,
                }],
            }
        except Exception as exc:
            logger.error("Whisper transcription failed: %s", exc)
            return {"status": "none", "languages": [], "transcripts": []}
        finally:
            # Clean up audio (keep VTT)
            if audio_path and audio_path.exists():
                audio_path.unlink()

    # ------------------------------------------------------------------
    def _download_audio(self, video_url: str) -> Path | None:
        """Download audio using yt-dlp (no ffmpeg required).
        faster-whisper can read m4a/webm/opus natively via the av library."""
        from yt_dlp import YoutubeDL

        outtmpl = str(self._storage_dir / "%(id)s.%(ext)s")
        opts = {
            "quiet": True,
            "no_warnings": True,
            "format": "bestaudio/best",
            "outtmpl": outtmpl,
        }
        if self._cookies_browser:
            opts["cookiesfrombrowser"] = (self._cookies_browser,)
        elif self._cookiefile:
            opts["cookiefile"] = self._cookiefile

        try:
            with YoutubeDL(opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                if not info:
                    return None
                video_id = info["id"]
        except Exception as exc:
            logger.warning("yt-dlp audio download failed: %s", exc)
            return None

        # yt-dlp downloads bestaudio, may be m4a/webm/opus depending on video
        for ext in ("m4a", "webm", "opus", "mp3", "aac"):
            audio_file = self._storage_dir / f"{video_id}.{ext}"
            if audio_file.exists():
                return audio_file

        return None

    def _transcribe(self, audio_path: Path) -> tuple[str, str]:
        """Run faster-whisper on audio, return (text, language_code)."""
        segments, info = self.model.transcribe(
            str(audio_path),
            beam_size=5,
            vad_filter=True,  # skip silence
        )
        lang = info.language or "en"

        lines = []
        for segment in segments:
            text = segment.text.strip()
            if text:
                lines.append(text)

        full_text = "\n".join(lines)
        logger.info(
            "Whisper transcribed %d segments, lang=%s, duration=%.1fs",
            len(lines), lang, info.duration,
        )
        return full_text, lang

    @staticmethod
    def _write_vtt(audio_path: Path, text: str) -> Path | None:
        """Write transcription as a simple VTT file."""
        vtt_path = audio_path.with_suffix(".vtt")
        # Simple VTT: one block with all text
        lines = ["WEBVTT", "", "00:00:00.000 --> 99:59:59.000", text]
        try:
            vtt_path.write_text("\n".join(lines), encoding="utf-8")
            return vtt_path
        except Exception as exc:
            logger.warning("Failed to write VTT: %s", exc)
            return None
