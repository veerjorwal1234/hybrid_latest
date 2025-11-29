import sqlite3
import os

def migrate_teacher_table():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'attendance.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if columns exist
        cursor.execute("PRAGMA table_info(teacher)")
        columns = [info[1] for info in cursor.fetchall()]

        if 'subject' not in columns:
            print("Adding 'subject' column...")
            cursor.execute("ALTER TABLE teacher ADD COLUMN subject TEXT")
        
        if 'branch' not in columns:
            print("Adding 'branch' column...")
            cursor.execute("ALTER TABLE teacher ADD COLUMN branch TEXT")
            
        if 'photo_path' not in columns:
            print("Adding 'photo_path' column...")
            cursor.execute("ALTER TABLE teacher ADD COLUMN photo_path TEXT")

        conn.commit()
        print("Migration completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_teacher_table()
