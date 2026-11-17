"""
database.py - Database access layer for AURASKIN.
Provides durable, thread-safe SQLite storage (auraskin.db) for Users, Sessions, and SkinAnalysisHistory.
No dummy or pre-seeded accounts: users register and persist permanently in SQLite.
"""

import os
import json
import sqlite3
import secrets
import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List

logger = logging.getLogger("auraskin.database")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(CURRENT_DIR, "auraskin.db")
UPLOADS_DIR = os.path.join(CURRENT_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


def get_sqlite_connection() -> sqlite3.Connection:
    """Create a thread-safe connection to auraskin.db with foreign keys enabled."""
    conn = sqlite3.connect(DB_FILE, timeout=15.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


# Backward compatibility alias
get_db_connection = get_sqlite_connection


def init_db():
    """
    Initializes database schema in auraskin.db.
    Creates Users, Sessions, and SkinAnalysisHistory tables with indexes.
    Zero dummy accounts are pre-seeded.
    """
    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Users (
                id TEXT PRIMARY KEY,
                fullName TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                createdAt TEXT NOT NULL
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS Sessions (
                token TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                expiresAt TEXT NOT NULL,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS SkinAnalysisHistory (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                imageUrl TEXT,
                detectedLabels TEXT,
                analysisResult TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON Sessions(token);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user ON Sessions(userId);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_history_user ON SkinAnalysisHistory(userId);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_history_created ON SkinAnalysisHistory(createdAt);")
        conn.commit()
    logger.info(f"[DATABASE] SQLite database initialized at: {DB_FILE}")


# ====================================================================
# USER & AUTH OPERATIONS
# ====================================================================

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieve user by case-insensitive email address."""
    norm_email = email.strip().lower()
    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, fullName, email, password, createdAt FROM Users WHERE LOWER(email) = ?",
            (norm_email,)
        )
        row = cursor.fetchone()
        return dict(row) if row else None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve user by unique ID."""
    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, fullName, email, password, createdAt FROM Users WHERE id = ?",
            (user_id,)
        )
        row = cursor.fetchone()
        return dict(row) if row else None


def create_user(full_name: str, email: str, password: str) -> Dict[str, Any]:
    """Register a new user in SQLite Users table."""
    user_id = f"usr_{int(time.time() * 1000)}_{secrets.token_hex(3)}"
    created_at = datetime.now(timezone.utc).isoformat()
    norm_email = email.strip().lower()

    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Users (id, fullName, email, password, createdAt)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, full_name.strip(), norm_email, password, created_at))
        conn.commit()

    return {
        "id": user_id,
        "fullName": full_name.strip(),
        "email": norm_email,
        "createdAt": created_at
    }


def create_session(user_id: str, days_valid: int = 7) -> str:
    """Create a new session token for the user."""
    token = secrets.token_hex(32)
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=days_valid)

    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Sessions (token, userId, createdAt, expiresAt)
            VALUES (?, ?, ?, ?)
        """, (token, user_id, now.isoformat(), expires.isoformat()))
        conn.commit()

    return token


def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify session token and return active user profile."""
    if not token:
        return None
    now_iso = datetime.now(timezone.utc).isoformat()

    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.fullName, u.email, u.createdAt
            FROM Sessions s
            JOIN Users u ON s.userId = u.id
            WHERE s.token = ? AND s.expiresAt > ?
        """, (token.strip(), now_iso))
        row = cursor.fetchone()
        return dict(row) if row else None


def delete_session(token: str) -> bool:
    """Delete a session token on logout."""
    if not token:
        return False
    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Sessions WHERE token = ?", (token.strip(),))
        conn.commit()
        return cursor.rowcount > 0


# ====================================================================
# SKIN ANALYSIS HISTORY OPERATIONS
# ====================================================================

def create_analysis_history(
    user_id: str,
    image_url: str,
    detected_labels: List[str],
    analysis_result: Dict[str, Any]
) -> Dict[str, Any]:
    """Saves a skin analysis session for a specific user into SkinAnalysisHistory."""
    history_id = f"hist_{int(time.time() * 1000)}_{secrets.token_hex(3)}"
    created_at = datetime.now(timezone.utc).isoformat()
    labels_json = json.dumps(detected_labels, ensure_ascii=False)
    result_json = json.dumps(analysis_result, ensure_ascii=False)

    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO SkinAnalysisHistory (id, userId, imageUrl, detectedLabels, analysisResult, createdAt)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (history_id, user_id, image_url, labels_json, result_json, created_at))
        conn.commit()

    return {
        "id": history_id,
        "userId": user_id,
        "imageUrl": image_url,
        "detectedLabels": detected_labels,
        "analysisResult": analysis_result,
        "createdAt": created_at
    }


def get_user_analysis_history(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves analysis history for a specific user, strictly isolated from other users."""
    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, userId, imageUrl, detectedLabels, analysisResult, createdAt
            FROM SkinAnalysisHistory
            WHERE userId = ?
            ORDER BY createdAt DESC
            LIMIT ?
        """, (user_id, limit))
        rows = cursor.fetchall()

    history = []
    for r in rows:
        try:
            labels = json.loads(r["detectedLabels"]) if r["detectedLabels"] else []
        except Exception:
            labels = []
        try:
            res_obj = json.loads(r["analysisResult"]) if r["analysisResult"] else {}
        except Exception:
            res_obj = {}

        history.append({
            "id": r["id"],
            "userId": r["userId"],
            "imageUrl": r["imageUrl"],
            "detectedLabels": labels,
            "analysisResult": res_obj,
            "createdAt": r["createdAt"]
        })
    return history


def get_analysis_history_item(history_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single analysis history item strictly checking user ownership."""
    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, userId, imageUrl, detectedLabels, analysisResult, createdAt
            FROM SkinAnalysisHistory
            WHERE id = ? AND userId = ?
        """, (history_id, user_id))
        r = cursor.fetchone()
        if not r:
            return None

    try:
        labels = json.loads(r["detectedLabels"]) if r["detectedLabels"] else []
    except Exception:
        labels = []
    try:
        res_obj = json.loads(r["analysisResult"]) if r["analysisResult"] else {}
    except Exception:
        res_obj = {}

    return {
        "id": r["id"],
        "userId": r["userId"],
        "imageUrl": r["imageUrl"],
        "detectedLabels": labels,
        "analysisResult": res_obj,
        "createdAt": r["createdAt"]
    }


def delete_analysis_history_item(history_id: str, user_id: str) -> bool:
    """Deletes a single history item verifying user ownership and cleans up image file."""
    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT imageUrl FROM SkinAnalysisHistory WHERE id = ? AND userId = ?",
            (history_id, user_id)
        )
        row = cursor.fetchone()
        image_url = row["imageUrl"] if row else None

        cursor.execute("""
            DELETE FROM SkinAnalysisHistory
            WHERE id = ? AND userId = ?
        """, (history_id, user_id))
        conn.commit()
        deleted = cursor.rowcount > 0

    if deleted and image_url and image_url.startswith("/uploads/"):
        filename = os.path.basename(image_url)
        file_path = os.path.join(UPLOADS_DIR, filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"Could not remove uploaded file {file_path}: {e}")

    return deleted


def clear_user_analysis_history(user_id: str) -> int:
    """Clears all history items belonging to the specified user and cleans up image files."""
    with get_sqlite_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT imageUrl FROM SkinAnalysisHistory WHERE userId = ?",
            (user_id,)
        )
        rows = cursor.fetchall()
        image_urls = [r["imageUrl"] for r in rows if r["imageUrl"]]

        cursor.execute("DELETE FROM SkinAnalysisHistory WHERE userId = ?", (user_id,))
        conn.commit()
        count = cursor.rowcount

    for img_url in image_urls:
        if img_url and img_url.startswith("/uploads/"):
            file_path = os.path.join(UPLOADS_DIR, os.path.basename(img_url))
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass

    return count
