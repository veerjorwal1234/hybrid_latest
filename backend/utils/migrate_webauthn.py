import sqlite3
import os

def migrate_student_table():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'attendance.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if columns exist
        cursor.execute("PRAGMA table_info(student)")
        columns = [info[1] for info in cursor.fetchall()]

        if 'credential_id' not in columns:
            print("Adding 'credential_id' column...")
            cursor.execute("ALTER TABLE student ADD COLUMN credential_id TEXT")
        
        if 'public_key' not in columns:
            print("Adding 'public_key' column...")
            cursor.execute("ALTER TABLE student ADD COLUMN public_key TEXT")
            
        if 'sign_count' not in columns:
            print("Adding 'sign_count' column...")
            cursor.execute("ALTER TABLE student ADD COLUMN sign_count INTEGER DEFAULT 0")

        conn.commit()
        print("Migration completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_student_table()
