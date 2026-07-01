#!/usr/bin/env python3
"""Small operator script for phase-1 membership management."""

from __future__ import annotations

import argparse
import datetime as dt
import sqlite3
from pathlib import Path


DB_PATH = Path(__file__).resolve().parent / "data" / "cover_maker.sqlite3"


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def main() -> None:
    parser = argparse.ArgumentParser(description="Manage Cover Maker users")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list", help="list users")
    role_cmd = sub.add_parser("set-role", help="set a user's role")
    role_cmd.add_argument("email")
    role_cmd.add_argument("role", choices=["free", "vip"])
    args = parser.parse_args()

    if not DB_PATH.exists():
        raise SystemExit(f"Database not found: {DB_PATH}. Start server.py once first.")

    with connect() as conn:
        if args.cmd == "list":
            rows = conn.execute(
                """
                SELECT id, email, role, created_at
                FROM users
                ORDER BY id DESC
                """
            ).fetchall()
            if not rows:
                print("No users yet.")
                return
            for row in rows:
                print(f"{row['id']:>4}  {row['role']:<4}  {row['email']}  {row['created_at']}")
            return

        if args.cmd == "set-role":
            now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
            cur = conn.execute(
                "UPDATE users SET role = ?, updated_at = ? WHERE email = ? COLLATE NOCASE",
                (args.role, now, args.email),
            )
            if cur.rowcount == 0:
                raise SystemExit(f"User not found: {args.email}")
            print(f"Updated {args.email} -> {args.role}")


if __name__ == "__main__":
    main()
