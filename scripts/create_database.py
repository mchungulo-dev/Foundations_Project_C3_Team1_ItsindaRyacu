import sqlite3
import os

DB_DIR = "database"
DB_NAME = "Ibimina_database.db"
DB_PATH = os.path.join(DB_DIR, DB_NAME)

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

    CREATE TABLE IF NOT EXISTS invitations(
        invitation_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INT NOT NULL,
        invite_token TEXT UNIQUE NOT NULL,
        member_id INT NOT NULL,
        role_assigned TEXT NOT NULL CHECK (role_assigned IN('admin', 'chairperson', 'treasurer', 'secretary', 'member')) DEFAULT 'member',
        status TEXT NOT NULL CHECK (status IN('pending', 'accepted', 'expired', 'revoked')) DEFAULT 'pending',
        expires_at DATE NOT NULL,
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        invited_by INT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES group_account(account_id)
    );

    CREATE TABLE IF NOT EXISTS members(
        member_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        member_name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL UNIQUE,
        national_id_number INTEGER NOT NULL UNIQUE,
        role TEXT NOT NULL CHECK(role IN('admin', 'chairperson', 'treasurer', 'secretary', 'member')) DEFAULT 'member',
        invite_id INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES group_account(account_id) ON DELETE CASCADE,
        FOREIGN KEY (invite_id) REFERENCES invitations(invitation_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS meetings(
        meeting_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        meeting_date DATE NOT NULL,
        meeting_time TIMESTAMP NOT NULL,
        meeting_type TEXT NOT NULL CHECK (meeting_type IN ('regular', 'emergency', 'special')) DEFAULT 'regular',
        minutes TEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES group_account(account_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES members(member_id) 
    );

    CREATE TABLE IF NOT EXISTS meeting_attendance(
        attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
        meeting_id INT NOT NULL,
        member_id INT NOT NULL,
        status TEXT NOT NULL CHECK (status IN('present', 'late', 'absent', 'excused')),
        marked_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id),
        FOREIGN KEY (member_id) REFERENCES members(member_id),
        FOREIGN KEY (marked_by) REFERENCES members(member_id),
        UNIQUE (meeting_id, member_id)
    );

    CREATE TABLE IF NOT EXISTS fines(
        fine_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        meeting_id INTEGER,
        member_id INTEGER NOT NULL,
        fine_amount NUMERIC NOT NULL,
        reason TEXT NOT NULL,
        is_paid BOOLEAN NOT NULL DEFAULT 0,
        paid_on DATE,
        recorded_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES group_account(account_id) ON DELETE CASCADE,
        FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id) ON DELETE SET NULL,
        FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES members(member_id)
    );

    CREATE TABLE IF NOT EXISTS cycles(
        cycle_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        contribution_amount NUMERIC NOT NULL,
        default_interest_rate NUMERIC NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('planned', 'active', 'closed')) DEFAULT 'planned',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES group_account(account_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS savings(
        saving_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cycle_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        amount NUMERIC NOT NULL,
        save_date DATE NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'reversed')) DEFAULT 'pending',
        recorded_by INTEGER NOT NULL,
        verified_by INTEGER,
        client_ref TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cycle_id) REFERENCES cycles(cycle_id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES members(member_id),
        FOREIGN KEY (verified_by) REFERENCES members(member_id)
    );

    CREATE TABLE IF NOT EXISTS loans(
        loan_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cycle_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        principal_amount NUMERIC NOT NULL,
        interest_rate NUMERIC NOT NULL,
        issue_date DATE,
        due_date DATE NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'disbursed', 'closed', 'rejected')) DEFAULT 'requested',
        approved_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cycle_id) REFERENCES cycles(cycle_id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES members(member_id)
    );

    CREATE TABLE IF NOT EXISTS repayments(
        repayment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_id INTEGER NOT NULL,
        amount_repaid NUMERIC NOT NULL,
        payment_date DATE NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'verified')) DEFAULT 'pending',
        recorded_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
        FOREIGN KEY (recorded_by) REFERENCES members(member_id)
    );

    CREATE TABLE IF NOT EXISTS share_outs(
        shareout_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cycle_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        savings_total NUMERIC NOT NULL,
        profit_share NUMERIC NOT NULL,
        total_amount NUMERIC NOT NULL,
        paid_on DATE,
        status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'paid')) DEFAULT 'pending',
        approved_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (cycle_id, member_id),
        FOREIGN KEY (cycle_id) REFERENCES cycles(cycle_id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES members(member_id)
    );
"""

def initialize_database():
    os.makedirs(DB_DIR, exist_ok=True)
    print(f"Initializing Ibimina database at '{DB_PATH}'...")

    try:
        with sqlite3.connect(DB_PATH) as connection:
            cursor = connection.cursor()
            cursor.executescript(TABLES_SQL)
            print("Database schema created successfully!")
    except sqlite3.Error as e:
        print(f"An error occurred while creating the database: {e}")

def insert_permissions():
    if os.path.exists(DB_PATH):
        resources = [
            'group_account', 'members', 'invitations', 'meetings', 'cycles',
            'meeting_attendance', 'fines', 'share_outs', 'loans', 'savings', 'repayments'
        ]

        actions = ['create', 'read', 'update', 'delete']
        permissions_data = []
        
        for resource in resources:
            for action in actions:
                permissions_data.append(('admin', resource, action, True))

                chair_allowed = False
                if action == 'read': chair_allowed = True
                elif resource in ['meetings', 'meeting_attendance', 'loans', 'fines', 'members'] and action in ['create', 'update']: chair_allowed = True
                permissions_data.append(('chairperson', resource, action, chair_allowed))

                treasurer_allowed = False
                if action == 'read': treasurer_allowed = True
                elif resource in ['savings', 'fines', 'repayments', 'share_outs', 'loans'] and action in ['create', 'update']: treasurer_allowed = True
                permissions_data.append(('treasurer', resource, action, treasurer_allowed))

                secretary_allowed = False
                if action == 'read': secretary_allowed = True
                elif resource in ['meetings', 'meeting_attendance', 'members', 'invitations'] and action in ['create', 'update']: secretary_allowed = True
                permissions_data.append(('secretary', resource, action, secretary_allowed))
                
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
            print(f"An error occurred inserting permissions: {e}")

def test_permissions():
    print("\n--- Testing Permissions ---")
    if os.path.exists(DB_PATH):
        try:
            with sqlite3.connect(DB_PATH) as connection:
                cursor = connection.cursor()
                
                # Helper function to check permission
                def check(role, resource, action):
                    cursor.execute(
                        "SELECT is_allowed FROM permissions WHERE role=? AND resource=? AND action=?", 
                        (role, resource, action)
                    )
                    result = cursor.fetchone()
                    return bool(result[0]) if result else False

                # 1. Member tests
                print(f"Member can delete members? {check('member', 'members', 'delete')}")
                print(f"Member can read savings? {check('member', 'savings', 'read')}")
                
                # 2. Chairperson tests
                print(f"Chairperson can create loans? {check('chairperson', 'loans', 'create')}")
                
                # 3. Admin tests
                print(f"Admin can update group account? {check('admin', 'group_account', 'update')}")

        except sqlite3.Error as e:
            print(f"An error occurred testing permissions: {e}")

if __name__=="__main__":
    initialize_database()
    insert_permissions()
    test_permissions()