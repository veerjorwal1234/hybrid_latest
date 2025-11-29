import sqlite3
import os

def migrate_challenge_column():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'attendance.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(student)")
        columns = [info[1] for info in cursor.fetchall()]

        if 'current_challenge' not in columns:
            print("Adding 'current_challenge' column...")
            cursor.execute("ALTER TABLE student ADD COLUMN current_challenge TEXT")

        conn.commit()
        print("Migration completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_challenge_column()
