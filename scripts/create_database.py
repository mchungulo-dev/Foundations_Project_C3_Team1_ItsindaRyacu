import sqlite3
import os

DB_DIR = "database"
DB_NAME = "Ibimina_database.db"
DB_PATH = os.path.join(DB_DIR, DB_NAME)

# Create the database tables
TABLES_SQL = """
    PRAGMA foreign_keys = on;

    CREATE TABLE IF NOT EXISTS group_account (
        account_id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_name TEXT NOT NULL,
        admin_email TEXT NOT NULL UNIQUE,
        admin_password_hash TEXT NOT NULL,
        savings_amount NUMERIC,
        location TEXT,
        meeting_day TEXT,
        meeting_time TIME,
        start_date DATE,
        late_fine_amount NUMERIC,
        absent_fine_amount NUMERIC,
        is_active BOOLEAN,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS members(
        member_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        member_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL UNIQUE,
        national_id_number INTEGER NOT NULL UNIQUE,
        role TEXT NOT NULL CHECK(role IN('admin', 'chairperson', 'treasurer', 'member')) DEFAULT 'member',
        invite_id INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES group_account(account_id) ON DELETE CASCADE,
        FOREIGN KEY (invite_id) REFERENCES invitations(invitation_id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS invitations(
        invitation_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INT NOT NULL,
        invite_token TEXT UNIQUE NOT NULL,
        member_id INT NOT NULL,
        role_assigned TEXT NOT NULL CHECK (role IN('admin', 'chairperson', 'treasurer', 'secretary', 'member')) DEFAULT 'member',
        status TEXT NOT NULL CHECK (status IN('pending', 'accepted', 'expired', 'revoked')) DEFAULT 'pending',
        expires_at DATE NOT NULL,
        accepted_at TIMESTAMP NOT NULL,
        creatd_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        invited_by INT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES group_account(account_id),
        FOREIGN KEY (member_id) REFERENCES members(member_id),
        FOREIGN KEY (invited_by) REFERENCES members(member_id)
    );


    CREATE TABLE IF NOT EXISTS meetings(
        meeting_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        meeting_date DATE NOT NULL,
        meeting_time TIMESTAMP NOT NULL,
        meeting_type TEXT NOT NULL CHECK (type IN ('regular', 'emmergency', 'special')) DEFAULT 'regular',
        minutes TEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES group_account(account_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES members(member_id) ON DELETE CASCADE    
    );

    CREATE TABLE IF NOT EXISTS meeting_attendance(
        attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
        meeting_id INT NOT NULL,
        member_id INT NOT NULL,
        status TEXT NOT NULL CHECK (status IN('present', 'late', 'absent', 'excused')),
        fine_amount NUMERIC DEFAULT 0,
        marked_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES meeting(meeting_id),
        FOREIGN KEY (member_id) REFERENCES members(member_id),
        FOREIGN KEY (marked_by) REFERENCES members(member_id),
        UNIQUE KEY unique_attendance (meeting_id, member_id)
    );
"""

def initialize_database ():
    # Check if database exists and remove it if it does exist
    os.makedirs(DB_DIR, exist_ok=True)
    print(f"Initializing Ibimina database at '{DB_PATH}'...")

    # Create connection
    try:
        with sqlite3.connect(DB_PATH) as connection:
            cursor = connection.cursor()

            # execute the script to make tables
            cursor.executescript(TABLES_SQL)

            print("Database schema created successfully!")

    except sqlite3.Error as e:
        print(f"An error occurred while creating the database: {e}")

if __name__=="__main__":
    initialize_database()
