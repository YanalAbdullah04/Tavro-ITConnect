# Tavro — ITConnect Platform

Tavro is a full-stack training and internship management platform that connects companies, trainers/mentors, and trainees in one structured workspace.
The system supports company-managed training programs, trainer-led task assignment and review, trainee internship browsing, task submissions, and GitHub App integration for real repository-based code review.

---

## Table of Contents

- [Overview](#overview)
- [Main Workspaces](#main-workspaces)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [GitHub App Integration](#github-app-integration)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [API Contract Notes](#api-contract-notes)
- [Manual QA Checklist](#manual-qa-checklist)
- [Known Notes](#known-notes)

---

## Overview

Tavro is designed around three main dashboards:

1. **Company Workspace**
   - Manage tracks.
   - Manage training sessions.
   - Manage trainers/mentors.
   - Create and manage internship posts.
   - Review and accept applicants.

2. **Trainer / Mentor Workspace**
   - View assigned training sessions.
   - Review trainees assigned to sessions.
   - Assign tasks to all trainees or selected trainees.
   - Track submitted tasks.
   - Review trainee repository/code submissions.

3. **Trainee / Student Workspace**
   - View dashboard, profile, tasks, and internships.
   - Browse and apply to internship opportunities.
   - Connect GitHub through a GitHub App.
   - Select a real repository and branch.
   - Submit task work using GitHub repository data.

---

## Main Workspaces

### Company

The Company workspace is responsible for the administrative side of training management.
It includes:

- Track management
- Training session management
- Post/opportunity management
- Trainer invitation and profile management
- Applicant review and acceptance
- Company-only route protection

### Trainer / Mentor

The Trainer workspace focuses on training execution and trainee follow-up.
It includes:

- Trainer dashboard
- Training session details
- Trainee lists
- Task assignment
- Conditional task assignment:
  - Assign to all trainees
  - Assign to selected trainees only
- Trainee task/submission review
- GitHub code viewing for submitted repositories

### Trainee / Student

The Trainee workspace is the trainee-facing part of the platform.
It includes:

- Profile management
- Dashboard overview
- Assigned tasks
- Internship browsing
- Internship application
- GitHub connection
- Repository and branch selection
- Task submission

---

## Core Features

### Authentication and Role-Based Access

The platform separates access by user role:

- `Company`
- `Trainer`
- `Trainee`

Each workspace is route-gated and aligned with backend authorization rules.

### Training Session Management

Companies can create training sessions connected to tracks and trainers.
Sessions support both paid and unpaid states.
Boolean values such as `IsPaid=false` are treated as valid business states.

### Applicant Management

Companies can review applicants and accept candidates into training sessions.
Applicant statuses are aligned with backend enum serialization and use string values such as `Accepted`.

### Task Assignment

Trainers can assign tasks using a `FormData` payload that supports:

- `TaskTitle`
- `Description`
- `Notes`
- `Deadline`
- `IncludeAll`
- optional `Attachment`
- repeated `TraineesId`

When `IncludeAll=true`, trainee selection is not required.
When `IncludeAll=false`, at least one trainee must be selected.

### Trainee Task Submission

Trainees submit task work using GitHub repository metadata:

- `taskAssignmentId`
- `githubRepo`
- `githubBranch`
- `githubRepoUrl`
- optional `githubCommitSha`

The commit SHA is nullable and should not block submission when unavailable.

### GitHub App Integration

The platform supports GitHub App installation for trainees.
Once connected, trainees can select real repositories and branches, and trainers can review submitted code without connecting their own GitHub accounts.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Modular API clients under `src/lib/api`
- Workspace-based pages and components

### Backend

- ASP.NET Core / .NET 8
- Entity Framework Core
- ASP.NET Identity
- FluentValidation
- GitHub App API integration
- Data Protection for secure GitHub install state

### Testing

- Backend contract and validation tests
- Focused tests for workspace API behavior
- GitHub integration contract tests

---

## Project Structure

```text
.
├── tavro/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   └── github/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   └── api/
│   │   └── pages/
│   │       └── dashboard/
│   └── package.json
│
├── tavro_backend/
│   └── ITConnect/
│       ├── Controllers/
│       ├── Data/
│       │   ├── RequestsModel/
│       │   └── ResponsesModel/
│       ├── Models/
│       ├── Services/
│       ├── Validators/
│       └── Program.cs
│
├── GITHUB_INTEGRATION_SETUP.md
├── WORKSPACE_API_POLISH_LOG.md
└── README.md
```

---

## Backend Setup

From the backend root:

```bash
cd tavro_backend
dotnet restore ITConnect.sln
dotnet build ITConnect.sln
```

Run the backend:

```bash
dotnet run --project ITConnect
```

If the backend runs on a local HTTPS port, note the URL because it will be needed for frontend API configuration and GitHub App setup.

---

## Frontend Setup

From the frontend root:

```bash
cd tavro
npm install
npm run dev
```

Build the frontend:

```bash
npm run build
```

---

## GitHub App Integration

The GitHub integration uses a GitHub App installation flow.

### Required GitHub App Settings

Create a GitHub App and configure:

```text
Setup URL:
https://YOUR_BACKEND_HOST/api/GitHub/callback
```

Required repository permissions:

```text
Metadata: Read-only
Contents: Read-only
```

The current integration does not require OAuth client secrets.

### Local Testing With ngrok

For local testing, the GitHub callback must be publicly reachable.
Run the backend locally, then expose it with ngrok:

```bash
ngrok http https://localhost:YOUR_BACKEND_PORT
```

Use the generated ngrok URL as the GitHub App Setup URL:

```text
https://YOUR_NGROK_DOMAIN/api/GitHub/callback
```

Because free ngrok URLs usually change between sessions, update the GitHub App Setup URL whenever the ngrok domain changes.

### GitHub Flow

```text
Trainee clicks Connect GitHub
→ Frontend calls GET /api/GitHub/install-url
→ Backend generates protected short-lived state
→ Frontend opens GitHub install popup
→ GitHub redirects to /api/GitHub/callback
→ Backend validates state and installation_id
→ Backend saves GithubInstallationId for the trainee
→ Popup sends a trusted-origin message to frontend
→ Frontend refreshes GitHub status and repositories
```

### GitHub Endpoints

```text
GET    /api/GitHub/install-url
GET    /api/GitHub/callback
GET    /api/GitHub/status
DELETE /api/GitHub/disconnect

GET /api/GitHub/repositories/{traineeId}
GET /api/GitHub/branches/{traineeId}/{owner}/{repoName}
GET /api/GitHub/content/{traineeId}/{owner}/{repoName}/{branch}
GET /api/GitHub/content/{traineeId}/{owner}/{repoName}/{branch}/{nested/path}
```

---

## Environment Variables

### Frontend

Create a frontend environment file if needed:

```text
VITE_API_BASE_URL=https://YOUR_BACKEND_URL
```

For local development without GitHub callback testing, this may point to localhost.
For GitHub callback testing, using the public ngrok backend URL is recommended.

### Backend

Use environment variables, .NET user-secrets, or an untracked local settings file.

Required GitHub config:

```text
GitHubConfig:AppId
GitHubConfig:AppSlug
GitHubConfig:PrivateKeyPath
Frontend:BaseUrl
```

Optional config:

```text
GitHubConfig:StateLifetimeMinutes
GitHubConfig:WebhookSecret
Backend:BaseUrl
```

Example:

```text
GitHubConfig:AppId=123456
GitHubConfig:AppSlug=tavro-local
GitHubConfig:PrivateKeyPath=/absolute/path/to/github-app-private-key.pem
Frontend:BaseUrl=http://localhost:5173
Backend:BaseUrl=https://YOUR_NGROK_DOMAIN
```

Never commit real private keys, secrets, or credentials.

---

## Running the Project

### 1. Start Backend

```bash
cd tavro_backend
dotnet run --project ITConnect
```

### 2. Start Frontend

```bash
cd tavro
npm run dev
```

### 3. Optional: Start ngrok for GitHub Testing

```bash
ngrok http https://localhost:YOUR_BACKEND_PORT
```

Update the GitHub App Setup URL with:

```text
https://YOUR_NGROK_DOMAIN/api/GitHub/callback
```

---

## Testing

### Frontend

```bash
cd tavro
npm run build
```

Scoped ESLint can be run on changed files when full lint is blocked by unrelated legacy issues.

### Backend

```bash
cd tavro_backend
dotnet build ITConnect.sln
dotnet test ITConnect.sln
```

The latest verification passed backend tests successfully, including workspace contract tests and GitHub integration contract tests.

---

## API Contract Notes

Important backend/frontend contract rules:

- Backend IDs are GUID strings.
- Status values are serialized as strings, not `{ value }` objects.
- Some update/delete endpoints return `204 No Content`.
- Frontend clients should not expect JSON from `204` endpoints.
- Nullable backend fields must be nullable in TypeScript.
- Boolean fields such as `IsPaid=false` and `IncludeAll=false` are valid values.
- Optional fields should not be forced unless backend business rules require them.
- ASP.NET validation dictionaries should be flattened and displayed clearly in the UI.

---

## Manual QA Checklist

### Company Workspace

- Create unpaid training session with `IsPaid=false`.
- Edit training session and confirm paid state is preserved.
- Create and edit posts.
- Confirm `Responsibility` and `Benefits` are preserved.
- Open applicant details.
- Accept applicant and confirm status becomes `Accepted`.

### Trainer / Mentor Workspace

- Open trainer dashboard.
- Open training session details.
- Assign task to all trainees.
- Assign task to selected trainees only.
- Confirm `IncludeAll=false` works.
- Confirm backend validation errors are displayed.
- Open trainee task list.
- Review trainee submission.

### Trainee / Student Workspace

- Open dashboard.
- Edit profile.
- Confirm phone and optional fields persist correctly.
- Browse internships.
- Apply to internship.
- Open task details.
- Submit task using GitHub repository data.

### GitHub Integration

- Connect GitHub as a trainee.
- Confirm real GitHub account metadata appears.
- Load real repositories.
- Load real branches.
- Submit task with selected repo and branch.
- Disconnect GitHub.
- Confirm status becomes disconnected.
- Sign in as trainer and view submitted code.

---

## Known Notes

- Real GitHub testing requires a configured GitHub App, a private key, and a public HTTPS callback URL.
- Local GitHub testing can be done with ngrok.
- Disconnecting from Tavro clears the saved installation link in Tavro. It does not uninstall the GitHub App from the user’s GitHub account.
- Production deployments should persist and share ASP.NET Data Protection keys across instances.
- Full frontend lint may still include unrelated existing warnings/errors in shared legacy files. Changed workspace files should pass scoped linting.

---

## Security Notes

- Do not expose private keys in the repository.
- Do not commit `.env` files containing secrets.
- GitHub callback state is protected and short-lived.
- Popup callback messages should be restricted to the configured frontend origin.
- Trainer GitHub content access must remain limited to trainees owned by that trainer through valid training/session/task relationships.
- Trainees must only access their own GitHub installation data.

---

## License

Add the project license here if applicable.
