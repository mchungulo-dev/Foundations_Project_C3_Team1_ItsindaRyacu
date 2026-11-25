# Itsinda Ryacu

A web platform for managing Rwanda’s community savings groups, known as **Ibimina**.

Itsinda Ryacu brings savings, loans, repayments, meetings, attendance, fines and group records into one place. It helps group officers maintain organised records and gives members access to their own financial information.

Developed by **Team One** for the **African Leadership University Foundations Project**.

## Project links

- **Live application:** [itsindaryacu.rwigamba.tech](https://itsindaryacu.rwigamba.tech/)
- **Trello board:** [Project planning and tasks](https://trello.com/invite/b/6adf1e5b9af7d2db4d949649/ATTIe0c37ee973359f2b955985429fbad841EC72EEDB/foundations-project-t1c3)
- **Source code:** [GitHub repository](https://github.com/mchungulo-dev/Foundations_Project_C3_Team1_ItsindaRyacu)

The Trello link is an invitation link. You may need to sign in to Trello to access the board.

## Why this project?

Paper-based group records can be difficult to reconcile, retrieve and share. Officers may need several notebooks to confirm a member’s savings, loan balance, attendance and unpaid fines.

Itsinda Ryacu connects these activities in one system, with separate views and actions for members and group officers. The project focuses on clearer records, accurate calculations and better access to information.

## Project modules

| Module | Purpose |
| --- | --- |
| Accounts and membership | Register groups, authenticate users, manage members and support invitations. |
| Savings | Record contributions and display their amounts, dates and verification status. |
| Loans | Submit applications, review decisions and record disbursement. |
| Repayments | Record payments and calculate the remaining loan balance. |
| Meetings | Maintain meeting dates, attendance and minutes. |
| Fines | Track penalties and whether they have been paid. |
| Savings cycles | Organise contributions, loans and group rules within a defined period. |
| Share-outs | Support end-of-cycle distribution calculations and records. |
| Dashboards and statements | Present group summaries and personal financial information. |
| Language support | Provide English and Kinyarwanda interfaces. |
| USSD | Provide an additional access channel for basic phones; see the setup limitations below. |

The system recognises five roles: **admin, chairperson, treasurer, secretary and member**. Available screens and actions depend on the user’s role and the permissions implemented by each route.

### Payment boundary

Itsinda Ryacu records financial activity. It does not hold money, operate a wallet or process payments through a bank or mobile-money provider.

Payments happen outside the platform and are recorded by authorised officers.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui and Recharts |
| Backend | Node.js, Express and JavaScript |
| Database | SQLite through better-sqlite3 |
| Authentication | bcrypt password hashing and JSON Web Tokens |
| Validation | Joi and frontend validation utilities |
| Database setup | Python’s built-in sqlite3 module |
| Testing | Node.js test runner, Vitest, React Testing Library and Postman |
| Deployment | Docker configuration for the backend and frontend; Nginx for the frontend |

### Architecture

```text
Web browser
    |
React frontend
    |
HTTP API
    |
Node.js / Express
    |
SQLite database
```

The repository also mounts a USSD callback route under `/ussd`. USSD requires additional gateway configuration and compatible database fields.

## Repository structure

```text
.
├── backend/
│   ├── config/             # Database connection
│   ├── middleware/         # Authentication and access checks
│   ├── routers/            # API endpoints
│   ├── tests/              # Backend calculation tests
│   ├── utils/              # Shared calculations and utilities
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── scripts/            # Translation checks
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── i18n/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── test/
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── scripts/
│   └── create_database.py
├── database/               # Created locally; ignored by Git
└── README.md
```

Install dependencies separately in `backend` and `frontend`. There is no root-level package.json.

## Run locally

### Prerequisites

Install:

- **Node.js 24**, recommended to match the Docker configuration.
- **npm**, included with Node.js.
- **Python 3.8 or later**.
- **Git**.

A separate SQLite server is not required. The SQLite terminal is optional and is useful for inspecting the database.

Check your installations:

```bash
node --version
npm --version
python --version
git --version
```

On Windows, use `py` instead of `python` if necessary.

### 1. Clone the repository

```bash
git clone https://github.com/mchungulo-dev/Foundations_Project_C3_Team1_ItsindaRyacu.git
cd Foundations_Project_C3_Team1_ItsindaRyacu
```

### 2. Initialise the database

Run this command from the repository root:

```bash
python scripts/create_database.py
```

On Windows, you can also use:

```powershell
py scripts/create_database.py
```

The script creates:

```text
database/Ibimina_database.db
```

The backend uses this file. Running the script from another directory can create a database in the wrong location.

The script creates tables and permission records. It does **not** create the Twitezimbere demonstration group or its accounts.

It uses `CREATE TABLE IF NOT EXISTS`; rerunning it does not migrate the structure of existing tables.

### 3. Configure the backend

From the repository root:

```bash
cd backend
npm install
```

Create a file named `.env` inside `backend`:

```env
PORT=3000
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173
```

You can generate a random secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `JWT_SECRET`.

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend listening port; defaults to `3000`. |
| `JWT_SECRET` | Secret used to sign and verify login tokens. |
| `CORS_ORIGIN` | Allowed frontend origin; supports comma-separated origins. |

Keep `.env` files and real credentials out of Git.

### 4. Start the backend

While inside `backend`:

```bash
node server.js
```

For automatic restarts during development:

```bash
npx nodemon server.js
```

The default backend address is:

```text
http://localhost:3000
```

Check the database connection by opening:

```text
http://localhost:3000/api/test-db
```

The endpoint should return a database connection message and a list of tables. This checks connectivity, not every application feature.

### 5. Configure the frontend

Open a second terminal at the repository root:

```bash
cd frontend
npm install
```

Create `frontend/.env` by copying `.env.example`.

**Git Bash, Linux or macOS:**

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

The file should contain:

```env
VITE_API_URL=http://localhost:3000
```

If you change the backend port, update this URL too.

### 6. Start the frontend

Inside `frontend`:

```bash
npm run dev
```

Open the address printed by Vite, usually:

```text
http://localhost:5173
```

Keep both terminals running. If Vite selects a different port, update `CORS_ORIGIN` in the backend configuration and restart the backend.

Restart Vite after changing frontend environment variables.

### 7. Create a local account

A newly initialised database contains no user accounts.

Once the frontend is complete and running:

1. Open the registration page.
2. Register a savings group and its administrator.
3. Sign in.
4. Create a savings cycle.
5. Add members or create invitations.
6. Use demonstration records to explore the workflows.

Accounts available on the hosted demonstration are not automatically created in your local database.

## Testing

### Backend unit tests

Run from `backend`:

```bash
node --test --test-reporter=spec tests/loan_calculations.test.js
```

The calculation tests cover:

- Flat-interest calculation.
- Zero-interest calculation.
- Balance after a partial repayment.
- Zero balance after full repayment.

The backend’s current `npm test` script is still a placeholder. Use the explicit command above.

These tests call calculation functions directly; the backend server does not need to be running.

### Frontend tests

Run from `frontend`:

```bash
npm test
```

For watch mode:

```bash
npm run test:watch
```

The frontend uses Vitest and React Testing Library. Its test configuration uses a demo data-mode setting; these tests do not independently prove live-backend integration.

### Frontend checks

Run from `frontend`:

```bash
npm run check:i18n
npm run lint
npm run typecheck
npm run build
```

The build command checks translation keys, runs the TypeScript build and generates the frontend bundle.

### Postman API testing

Start the backend before sending requests.

For JSON requests, use:

```http
Content-Type: application/json
```

For protected routes, select **Bearer Token** in Postman’s Authorization tab and provide the token returned by login.

Example login:

```http
POST http://localhost:3000/auth/login
```

```json
{
  "email": "your-registered-email@example.com",
  "password": "your-password"
}
```

Useful test scenarios include:

- Successful registration and login.
- Incorrect password.
- Missing required fields.
- Missing or expired authentication token.
- Requests made with the wrong role.
- Negative loan or repayment amounts.
- Duplicate pending loan applications.
- Partial repayment and remaining balance.
- Repayment exceeding the outstanding balance.

A rejected request can be a passing test when rejection is the expected behaviour.

### Main API route groups

| Base path | Area |
| --- | --- |
| `/auth/admin` | Group registration |
| `/auth` | Login |
| `/admin` | Member management |
| `/savings` | Contributions and summaries |
| `/cycles` | Savings cycles |
| `/loans` | Applications, decisions, disbursement and repayments |
| `/api/meetings` | Meetings and related records |
| `/share-out` | Cycle distributions |
| `/invitation` | Invitations |
| `/ussd` | USSD callback and related operations |

Route requirements vary. Consult the corresponding file in `backend/routers` for the exact HTTP method, request fields and access checks.

## Build and deployment

### Frontend production build

Inside `frontend`:

```bash
npm run build
```

Output is written to:

```text
frontend/dist
```

Preview the generated build locally:

```bash
npm run preview
```

`VITE_API_URL` is included at build time. Set the production API URL before building. Previewing the frontend does not start the backend.

### Docker configuration

The repository includes separate Dockerfiles:

- `backend/Dockerfile` uses the repository root as its build context.
- `frontend/Dockerfile` uses the frontend directory as its build context.

The backend container initialises the database when the database file is absent. Mount persistent storage at `/app/database` so records survive container replacement.

The frontend container serves its build through Nginx and includes a fallback for client-side routes.

Deployment also requires environment configuration, a reachable API and appropriate allowed frontend origins.

## Current limitations

### Repository completeness

The reviewed checkout contains imports for frontend modules that are not present, including:

- `frontend/src/api/mode`
- `frontend/src/api/demo-auth`
- Loan list and detail page modules.
- The savings-recording page module.
- The share-out page entry module.

These files must be included in the repository, or the corresponding imports must be corrected, before a fresh clone can run or build the complete frontend. Installing npm packages does not restore missing project source files.

### USSD and offline support

USSD route code is present, but the database initializer does not currently create the member PIN field or the `sync_queue` table referenced by that code.

USSD therefore needs schema alignment, PIN setup and gateway configuration before it can be treated as ready to use. The presence of USSD routes does not establish complete offline browser support.

### Integration and evaluation

- Some frontend workflows and backend endpoints still require alignment.
- Automated SMS/email reminders and bank/mobile-money payment integration are not part of the completed prototype.
- Investment support remains future work.
- Large-scale concurrent use has not been established by the project’s evaluation.
- Developer tests and seeded demonstrations do not replace acceptance testing with a real savings group.
- Database setup is not yet a versioned migration system.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `npm` cannot find package.json | Run npm commands inside `backend` or `frontend`, not at the repository root. |
| `unable to open database file` or missing tables | Initialize the database from the repository root and check the backend’s configured database path. |
| `no such column` | Your database may use an older schema. Compare it with `scripts/create_database.py`; the initializer does not migrate existing tables. |
| Login fails on a fresh database | Register a group first. Hosted demonstration accounts are not seeded locally. |
| Token errors | Check `JWT_SECRET`, restart the backend and sign in again. |
| CORS or connection errors | Check the backend is running, `VITE_API_URL` is correct and `CORS_ORIGIN` matches the frontend origin. |
| Frontend import/module errors | Check that the referenced source files are present; see Repository completeness above. |
| PowerShell blocks npm or nodemon scripts | Use `npm.cmd`, `npx.cmd nodemon server.js`, or run `node server.js`. |
| better-sqlite3 installation fails | Check your Node version and the installation error. Native compilation may require platform build tools. |
| Deployed frontend cannot reach the API | Check that the API is publicly reachable and uses HTTPS when the frontend uses HTTPS. |

Back up any database containing records before changing its schema or replacing it.

## Team workflow

We used an iterative development process, supported by GitHub for source control and Trello for task planning.

To contribute:

1. Review the relevant Trello task.
2. Create a branch for the change.
3. Keep frontend requests, backend routes, and database fields consistent.
4. Update both English and Kinyarwanda text when adding interface messages.
5. Run the relevant tests and checks.
6. Open a pull request describing the change and its validation.
7. Request a teammate’s review before merging.

Do not commit local databases, environment secrets or real members’ financial records.

## Future improvements

- Complete missing source modules and frontend/backend integration.
- Introduce versioned database migrations.
- Complete and test the USSD workflow.
- Add offline capture and reliable synchronization.
- Integrate automated reminders and mobile-money services.
- Expand integration and end-to-end tests.
- Evaluate usability and record-management time with a real savings group.
- Strengthen backup, recovery and production security procedures.
