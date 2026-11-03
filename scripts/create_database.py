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

    CREATE TABLE IF NOT EXISTS permissions(
        permission_id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL CHECK (role IN('admin', 'chairperson', 'treasurer', 'secretary', 'member')) DEFAULT 'member',
        resource TEXT NOT NULL CHECK (resource IN('group_account', 'members', 'invitations', 'meetings', 'meeting_attendance', 'fines', 'shares_out', 'loans', 'savings', 'cycles', 'repayments')),
        action TEXT NOT NULL CHECK (action IN('create', 'read', 'update', 'delete')),
        is_allowed BOOLEAN NOT NULL DEFAULT FALSE,
        UNIQUE (role, resource, action)
    ); 

    CREATE TABLE IF NOT EXISTS members(
        member_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        member_name TEXT NOT NULL,
        email TEXT,
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
        role_assigned TEXT NOT NULL CHECK (role_assigned IN('admin', 'chairperson', 'treasurer', 'secretary', 'member')) DEFAULT 'member',
        status TEXT NOT NULL CHECK (status IN('pending', 'accepted', 'expired', 'revoked')) DEFAULT 'pending',
        expires_at DATE NOT NULL,
        accepted_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        meeting_type TEXT NOT NULL CHECK (meeting_type IN ('regular', 'emmergency', 'special')) DEFAULT 'regular',
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
        FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id),
        FOREIGN KEY (member_id) REFERENCES members(member_id),
        FOREIGN KEY (marked_by) REFERENCES members(member_id),
        UNIQUE (meeting_id, member_id)
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


def insert_permissions():
    if os.path.exists(DB_PATH):
        resources = [
            'group_account', 'members', 'invitations', 'meetings', 'cycles'
            'meeting_attendance', 'fines', 'shares_out', 'loans', 'savings', 'repayments'
        ]

        actions = ['create', 'read', 'update', 'delete']
        permissions_data = []
        for resource in resources:
            for action in actions:
                # 1. ADMINS full CRUD permissions
                permissions_data.append(('admin', resource, action, True))

                # 2. CHAIRPERSON: Can read everything, create/update meetings, loans, fines and members
                chair_allowed = False
                if action == 'read':
                    chair_allowed = True
                elif resource in ['meetings', 'meeting_attendance', 'loans', 'fines', 'members'] and action in ['create', 'update']:
                    chair_allowed = True
                permissions_data.append(('chairperson', resource, action, chair_allowed))

                # 3. TREASURER: Full control over financial resources(savings, fines, repayments, shares-out, loans)
                treasurer_allowed = False
                if action == 'read':
                    treasurer_allowed = True
                elif resource in ['savings', 'fines', 'repayments', 'shares_out', 'loans'] and action in ['create', 'update']:
                    treasurer_allowed = True

                permissions_data.append(('treasurer', resource, action, treasurer_allowed))

                # 4. SECRETARY: Full control of meetings(meetings, meeting_attendance, invitations, members)
                secretary_allowed = False
                if action == 'read':
                    secretary_allowed = True
                elif resource in ['meetings', 'meeting_attendance', 'members', 'invitations'] and action in ['create', 'update']:
                    secretary_allowed = True

                permissions_data.append(('secretary', resource, action, secretary_allowed))
                
                # 4. MEMBERS: Read-only permissions
                is_member_allowed = 1 if action == 'read' else 0
                permissions_data.append(('member', resource, action, is_member_allowed))


        try:
            with sqlite3.connect(DB_PATH) as connection:
                cursor = connection.cursor()


                cursor.executemany(
                    """
                    INSERT OR IGNORE INTO permissions (role, resource, action, is_allowed) VALUES(?, ?, ?, ?)
                    """,
                    permissions_data
                )
                connection.commit()
                print("Role-specific administaration and member permissions inserted successfully!")
                print(f"Rows affected: {cursor.rowcount}")

        except sqlite3.Error as e:
            print(f"An error occurred inserting permissions {e}")


if __name__=="__main__":
    initialize_database()
    insert_permissions()
