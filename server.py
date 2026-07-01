#!/usr/bin/env python3
"""
Lightweight production-minded server for Cover Maker phase 1.

Features:
- serves the existing static app
- email/password accounts
- HttpOnly cookie sessions
- free/VIP role checks
- daily download quota for free members

Run:
  python3 server.py --host 127.0.0.1 --port 8097
"""

from __future__ import annotations

import argparse
import base64
import datetime as dt
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


APP_DIR = Path(__file__).resolve().parent
DATA_DIR = APP_DIR / "data"
DB_PATH = DATA_DIR / "cover_maker.sqlite3"
SESSION_COOKIE = "cm_session"
FREE_DAILY_DOWNLOADS = 3
SESSION_TTL_SECONDS = 60 * 60 * 24 * 30


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def today_key() -> str:
    return dt.datetime.now().strftime("%Y-%m-%d")


def connect_db() -> sqlite3.Connection:
    DATA_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    with connect_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT NOT NULL UNIQUE COLLATE NOCASE,
              password_hash TEXT NOT NULL,
              role TEXT NOT NULL DEFAULT 'free' CHECK(role IN ('free', 'vip')),
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sessions (
              token TEXT PRIMARY KEY,
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              expires_at INTEGER NOT NULL,
              created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS download_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              download_date TEXT NOT NULL,
              count INTEGER NOT NULL,
              scope TEXT NOT NULL,
              created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_download_logs_user_date
              ON download_logs(user_id, download_date);
            """
        )


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 210_000)
    return "pbkdf2_sha256$210000$" + base64.b64encode(salt).decode() + "$" + base64.b64encode(digest).decode()


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iterations, salt_b64, digest_b64 = stored.split("$", 3)
        if algo != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(digest_b64)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations))
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def normalize_email(email: str) -> str:
    return str(email or "").strip().lower()


def public_user(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if not row:
        return None
    return {
        "id": row["id"],
        "email": row["email"],
        "role": row["role"],
    }


def used_downloads_today(conn: sqlite3.Connection, user_id: int) -> int:
    row = conn.execute(
        "SELECT COALESCE(SUM(count), 0) AS used FROM download_logs WHERE user_id = ? AND download_date = ?",
        (user_id, today_key()),
    ).fetchone()
    return int(row["used"] or 0)


def limits_payload(conn: sqlite3.Connection, user: sqlite3.Row | None) -> dict[str, Any]:
    if not user:
        return {
            "freeDailyDownloads": FREE_DAILY_DOWNLOADS,
            "usedToday": 0,
            "remainingToday": 0,
            "canBatchDownload": False,
        }
    if user["role"] == "vip":
        return {
            "freeDailyDownloads": FREE_DAILY_DOWNLOADS,
            "usedToday": 0,
            "remainingToday": None,
            "canBatchDownload": True,
        }
    used = used_downloads_today(conn, int(user["id"]))
    return {
        "freeDailyDownloads": FREE_DAILY_DOWNLOADS,
        "usedToday": used,
        "remainingToday": max(FREE_DAILY_DOWNLOADS - used, 0),
        "canBatchDownload": False,
    }


class AppHandler(SimpleHTTPRequestHandler):
    server_version = "CoverMakerServer/1.0"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store" if self.path.startswith("/api/") else "no-cache")
        super().end_headers()

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/me":
            self.handle_me()
            return
        super().do_GET()

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/register":
            self.handle_register()
        elif path == "/api/login":
            self.handle_login()
        elif path == "/api/logout":
            self.handle_logout()
        elif path == "/api/downloads/authorize":
            self.handle_download_authorize()
        else:
            self.send_json({"ok": False, "error": "Not found"}, HTTPStatus.NOT_FOUND)

    def read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            raise ValueError("请求格式不是有效 JSON")

    def send_json(self, payload: dict[str, Any], status: HTTPStatus = HTTPStatus.OK, cookies: list[str] | None = None) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if cookies:
            for cookie in cookies:
                self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(body)

    def cookie_token(self) -> str | None:
        cookie = SimpleCookie(self.headers.get("Cookie"))
        morsel = cookie.get(SESSION_COOKIE)
        return morsel.value if morsel else None

    def session_cookie(self, token: str, max_age: int = SESSION_TTL_SECONDS) -> str:
        return f"{SESSION_COOKIE}={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={max_age}"

    def clear_session_cookie(self) -> str:
        return f"{SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"

    def current_user(self, conn: sqlite3.Connection) -> sqlite3.Row | None:
        token = self.cookie_token()
        if not token:
            return None
        now = int(time.time())
        row = conn.execute(
            """
            SELECT users.*
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token = ? AND sessions.expires_at > ?
            """,
            (token, now),
        ).fetchone()
        if not row:
            conn.execute("DELETE FROM sessions WHERE token = ? OR expires_at <= ?", (token, now))
        return row

    def create_session(self, conn: sqlite3.Connection, user_id: int) -> str:
        token = secrets.token_urlsafe(32)
        conn.execute(
            "INSERT INTO sessions(token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
            (token, user_id, int(time.time()) + SESSION_TTL_SECONDS, utc_now()),
        )
        return token

    def auth_payload(self, conn: sqlite3.Connection, user: sqlite3.Row | None) -> dict[str, Any]:
        return {
            "ok": True,
            "authenticated": bool(user),
            "user": public_user(user),
            "limits": limits_payload(conn, user),
        }

    def handle_me(self) -> None:
        with connect_db() as conn:
            user = self.current_user(conn)
            self.send_json(self.auth_payload(conn, user))

    def handle_register(self) -> None:
        try:
            payload = self.read_json()
            email = normalize_email(payload.get("email", ""))
            password = str(payload.get("password", ""))
            if "@" not in email or len(email) > 180:
                self.send_json({"ok": False, "code": "INVALID_EMAIL", "message": "请输入有效邮箱"}, HTTPStatus.BAD_REQUEST)
                return
            if len(password) < 6:
                self.send_json({"ok": False, "code": "WEAK_PASSWORD", "message": "密码至少 6 位"}, HTTPStatus.BAD_REQUEST)
                return
            with connect_db() as conn:
                now = utc_now()
                try:
                    cur = conn.execute(
                        "INSERT INTO users(email, password_hash, role, created_at, updated_at) VALUES (?, ?, 'free', ?, ?)",
                        (email, hash_password(password), now, now),
                    )
                except sqlite3.IntegrityError:
                    self.send_json({"ok": False, "code": "EMAIL_EXISTS", "message": "这个邮箱已经注册"}, HTTPStatus.CONFLICT)
                    return
                token = self.create_session(conn, int(cur.lastrowid))
                user = conn.execute("SELECT * FROM users WHERE id = ?", (int(cur.lastrowid),)).fetchone()
                self.send_json(self.auth_payload(conn, user), cookies=[self.session_cookie(token)])
        except ValueError as exc:
            self.send_json({"ok": False, "message": str(exc)}, HTTPStatus.BAD_REQUEST)

    def handle_login(self) -> None:
        try:
            payload = self.read_json()
            email = normalize_email(payload.get("email", ""))
            password = str(payload.get("password", ""))
            with connect_db() as conn:
                user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
                if not user or not verify_password(password, user["password_hash"]):
                    self.send_json({"ok": False, "code": "BAD_CREDENTIALS", "message": "邮箱或密码不正确"}, HTTPStatus.UNAUTHORIZED)
                    return
                token = self.create_session(conn, int(user["id"]))
                self.send_json(self.auth_payload(conn, user), cookies=[self.session_cookie(token)])
        except ValueError as exc:
            self.send_json({"ok": False, "message": str(exc)}, HTTPStatus.BAD_REQUEST)

    def handle_logout(self) -> None:
        token = self.cookie_token()
        with connect_db() as conn:
            if token:
                conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
            self.send_json({"ok": True}, cookies=[self.clear_session_cookie()])

    def handle_download_authorize(self) -> None:
        try:
            payload = self.read_json()
            count = max(1, min(int(payload.get("count") or 1), 500))
            scope = str(payload.get("scope") or "single")[:40]
            with connect_db() as conn:
                user = self.current_user(conn)
                if not user:
                    self.send_json(
                        {"ok": False, "code": "LOGIN_REQUIRED", "message": "请先登录后下载"},
                        HTTPStatus.UNAUTHORIZED,
                    )
                    return
                if user["role"] == "vip":
                    self.send_json(self.auth_payload(conn, user) | {"authorized": True})
                    return
                if scope != "single" or count != 1:
                    self.send_json(
                        {"ok": False, "code": "VIP_REQUIRED", "message": "普通会员不支持批量下载,请升级 VIP"},
                        HTTPStatus.FORBIDDEN,
                    )
                    return
                used = used_downloads_today(conn, int(user["id"]))
                if used + count > FREE_DAILY_DOWNLOADS:
                    self.send_json(
                        {
                            "ok": False,
                            "code": "DAILY_LIMIT_EXCEEDED",
                            "message": f"普通会员每天最多下载 {FREE_DAILY_DOWNLOADS} 张",
                            "limits": limits_payload(conn, user),
                        },
                        HTTPStatus.FORBIDDEN,
                    )
                    return
                conn.execute(
                    "INSERT INTO download_logs(user_id, download_date, count, scope, created_at) VALUES (?, ?, ?, ?, ?)",
                    (int(user["id"]), today_key(), count, scope, utc_now()),
                )
                self.send_json(self.auth_payload(conn, user) | {"authorized": True})
        except (ValueError, TypeError):
            self.send_json({"ok": False, "message": "下载授权参数错误"}, HTTPStatus.BAD_REQUEST)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8097)
    args = parser.parse_args()
    init_db()
    httpd = ThreadingHTTPServer((args.host, args.port), AppHandler)
    print(f"Cover Maker server running at http://{args.host}:{args.port}/index.html")
    print(f"Database: {DB_PATH}")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
