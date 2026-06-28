# Tavro Workspace Runtime QA

## 1. Environment

- Frontend mode: production build served by Vite preview
- Backend mode: real backend running and reachable
- API source: real backend API configured
- Date: 2026-05-29
- Build command: `npm run build`
- Preview command: `npm run preview -- --host 127.0.0.1 --port 4173`
- Browser automation note: no headless browser binary was available in this environment, so route checks were verified through preview HTTP responses plus source/bundle inspection. Credentialed browser QA still needs a manual or Playwright pass.

## 2. Summary

- Overall status: Partial Pass
- Public build, preview startup, public route HTTP serving, static terminology sweep, and signup mentor removal checks passed.
- Main blockers:
  - Real demo credentials were not available in this task input; the provided credential values were placeholders, so login, role redirect, protected workspace API, and mutation QA could not be completed safely.
  - No frontend `/profile-setting` route/page is registered in `src/App.tsx`, even though the backend email link targets `/profile-setting?token={jwt}`.
- Main warnings:
  - Build reports stale Browserslist data.
  - Build reports a large JavaScript chunk.
  - Browser console/network QA was not possible without a browser runtime.

## 3. Build Results

- `npm run build`: Passed
- `npm run preview -- --host 127.0.0.1 --port 4173`: Passed after local port binding was allowed
- Backend reachability:
  - Backend Swagger route returned HTTP 200
  - Public internship/opportunity endpoint returned HTTP 200 without credentials
- Non-blocking warnings:
  - Browserslist data is 11 months old.
  - One bundled JS chunk is larger than 500 kB after minification.

## 4. Static Terminology Sweep

- Searched source for:
  - `IT Connect`
  - `Student Dashboard`
  - `Trainer Dashboard`
  - `Admin Dashboard`
  - `Register Trainer`
  - `Mentor direct signup`
  - `Invite code`
  - `From /api/`
  - lowercase `/api/github`
  - direct `fetch(`
- Results:
  - No lowercase `/api/github` calls remain.
  - No direct `fetch(` remains outside `src/lib/api/client.ts`; `refetch()` method names were ignored.
  - No old debug labels like `From /api/` were found.
  - No public `Mentor Path`, `Invite code`, or `Register Trainer` strings were found in the built `dist` bundle.
- Fixes applied:
  - Public landing copy changed from visible Task/Tasks wording to Mission/Missions where safe.
  - Public Tavro path visual changed from Task/Review/Internship wording to Mission/Checkpoint/Opportunity language where safe.
  - Navbar labels aligned to `Login` and `Get Started`.
- Intentionally ignored:
  - Internal file names, component names, API module names, DTO names, backend endpoint names, route params, token storage keys, and comments that describe backend/internal terms.

## 5. Public Routes QA

| Route | Status | Notes |
|---|---|---|
| `/` | Pass | Preview returned HTTP 200. Static terminology fixes applied for public Tavro copy. |
| `/services` | Pass | Preview returned HTTP 200. |
| `/companies` | Pass | Preview returned HTTP 200. Source uses Tavro public shell and Companies route is registered. |
| `/contact` | Pass | Preview returned HTTP 200. |
| `/login` | Pass | Preview returned HTTP 200. Navbar source now uses `Login`. |
| `/signup` | Pass | Preview returned HTTP 200. Built bundle includes `Trainee Path` and `Company Path`; no `Mentor Path` or `Invite code` strings found. |
| `/profile-setting?token=dummy-token-for-route-render-check` | Blocked | Preview returned HTTP 200 because Vite serves the SPA fallback, but `src/App.tsx` has no registered `/profile-setting` route/page. A browser render would fall through to `NotFound`. |

## 6. Signup / Mentor Onboarding QA

- Public signup options: Pass
  - `Trainee Path`
  - `Company Path`
- Mentor direct signup removed: Pass
  - No public `Mentor Path` tab/card remains.
  - No public invite-code form remains.
  - No public `Register Trainer` copy found.
- Profile-setting route preserved: Blocked
  - `accountApi.setTrainerProfile` still exists for `POST /api/Account/Trainer/profile-setting`.
  - No frontend route/page for `/profile-setting?token=...` exists in `src/App.tsx`.
- Invite-code flow: Pass
  - Not implemented and not displayed.
- Company-side Invite Mentor: Source Verified
  - `TrainerManagement` includes an `Invite Mentor` action and modal.
  - Modal uses Mentor terminology.
  - Modal has no invite-code field and no password field.
  - API method uses `POST /api/Account/Register/Trainer` through `accountApi.inviteMentor`.
  - `accountApi.inviteMentor` does not call `setAuthSession` or overwrite auth storage.
- Mutation testing: Skipped
  - No real company demo credentials were available.
  - Sending an invite may send a real email, so this should be retested only with a safe demo email.

## 7. Auth QA

| Role | Status | Redirect | Logout | Notes |
|---|---|---|---|---|
| Company demo account | Blocked | Not tested | Not tested | The provided credential values were placeholders. Do not write real passwords into this report. |
| Trainee demo account | Blocked | Not tested | Not tested | The provided credential values were placeholders. |
| Mentor demo account | Blocked | Not tested | Not tested | The provided credential values were placeholders. |

Source-level auth notes:

- `getDashboardPathForRole` maps Company/Admin roles to `/dashboard/company`.
- `getDashboardPathForRole` maps `Trainer` to `/dashboard/trainer`.
- `getDashboardPathForRole` maps `Trainee` and legacy `Student` to `/dashboard/student`.
- `ProtectedRoute` clears expired/missing tokens and redirects to `/login`.

## 8. Company Workspace QA

- Runtime status: Blocked without company credentials.
- Source/static verification:
  - Company Workspace route is registered at `/dashboard/company/*`.
  - Company overview uses API modules for tracks, sessions, mentors, opportunities, and candidates.
  - Training Operations Flow, Capacity Overview, Candidate Status, and Opportunity Status are present in source.
  - No company GitHub/code review workflow was found in the Company Workspace.
  - Quick actions use existing company routes.
- Invite Mentor status:
  - Button and modal are present in `src/components/admin/TrainerManagement.tsx`.
  - Required validation exists for name, email, and phone.
  - Email format validation exists.
  - Form sends full name, email, phone, and optional specialization.
  - Mentors list invalidates/refetches after a successful invite.
  - Auth token preservation is handled by using `accountApi.inviteMentor` without session writes.
- Remaining runtime checks:
  - API loading with a real company token.
  - Chart rendering against real company data.
  - Invite Mentor success/error handling with a safe demo email.
  - Confirm company token remains unchanged after a successful invite.

## 9. Trainee Workspace QA

- Runtime status: Blocked without trainee credentials.
- Source/static verification:
  - Trainee Workspace route is registered at `/dashboard/student`.
  - Trainee dashboard uses `traineeApi.getDashboard`.
  - Submission state uses backend submission API first and preserves localStorage fallback for compatibility.
  - GitHub UI uses centralized GitHub API module with documented `/api/GitHub/...` casing.
  - Opportunities route and details route remain registered.
- Remaining runtime checks:
  - Login redirect to Trainee Workspace.
  - Dashboard data from `GET /api/Trainee/Dashboard`.
  - Backend submission state vs localStorage fallback behavior.
  - GitHub repository, branch, content, and nested file path behavior.
  - Opportunity detail/apply flow with a real trainee account.

## 10. Mentor Workspace QA

- Runtime status: Blocked without mentor credentials.
- Source/static verification:
  - Mentor Workspace route is registered at `/dashboard/trainer`.
  - Mentor dashboard uses `trainerApi.getDashboard`.
  - Session detail route exists for `/dashboard/trainer/training/:trainingId`.
  - Trainee Missions route exists for `/dashboard/trainer/training/:trainingId/student/:studentId/tasks`.
  - No fake review/feedback submit endpoint was introduced.
- Remaining runtime checks:
  - Login redirect to Mentor Workspace.
  - `GET /api/Trainer/Dashboard` with a real mentor token.
  - `GET /api/Trainer/TrainingSession/{id}` on assigned sessions.
  - `GET /api/Trainee/{id}/Tasks` from mentor trainee mission views.
  - Empty states and terminology in browser.

## 11. API / Runtime Errors

| Endpoint / Route | Error | Likely Cause | Fixed or Remaining |
|---|---|---|---|
| `/profile-setting?token=...` | No registered frontend route/page | Backend email link expects this route, but the frontend only has the API helper | Remaining blocker |
| Protected workspace routes | Credentialed runtime QA not executed | Demo account credentials supplied in the task were placeholders | Remaining blocker |
| Browser console/network QA | Not executed | No headless browser binary available in this environment | Remaining blocker for full runtime QA |
| Build | Browserslist stale data warning | Dependency metadata age | Non-blocking |
| Build | Large chunk warning | App bundle size exceeds Vite warning threshold | Non-blocking |

## 12. Fixes Applied During QA

| File | Issue | Fix |
|---|---|---|
| `src/pages/Landing.tsx` | Visible public copy still used Task/Tasks and generic review wording | Updated to Mission/Missions and Mentor Checkpoints where safe |
| `src/components/public/TavroPublic.tsx` | Public Tavro visual still used Real Tasks, Task meta, Review, and Internship opportunity | Updated labels to Real Missions, Mission, Checkpoint, and Opportunity |
| `src/components/Navbar.tsx` | Navbar labels did not exactly match requested `Login` / `Get Started` wording | Updated desktop and mobile labels without changing routes |

## 13. Remaining TODOs

| Priority | Owner | Notes |
|---|---|---|
| P0 | Frontend | Add or restore the real `/profile-setting?token=...` frontend route/page for backend mentor email links. Do not redesign it; wire to existing profile-setting API flow. |
| P0 | QA / Project owner | Provide real demo credentials securely outside source files/reports and rerun credentialed auth/workspace QA. |
| P1 | QA | Run browser-based QA with console and network capture for public routes and all workspaces. |
| P1 | QA / Company demo account | Test Invite Mentor with a safe demo email and verify the company token is not replaced. |
| P1 | QA / Trainee demo account | Test GitHub repository, branch, content, and nested file path flows with a connected trainee account. |
| P2 | Frontend | Consider code splitting to reduce the large production chunk warning. |
| P2 | Frontend | Update Browserslist database during dependency maintenance. |

## 14. Final Readiness

- Ready for demo: Partial
- Public route serving, build, preview, signup mentor removal, and static terminology checks are ready.
- Not ready to declare full production runtime pass until:
  - real demo credentials are used for role login and workspace API QA,
  - `/profile-setting?token=...` has a registered frontend route/page,
  - browser console/network QA is completed,
  - Invite Mentor is tested with a safe demo email from an authenticated company session.

## Public/Auth Mobile Responsiveness Pass

- Pages updated:
  - Landing page
  - Services page
  - Companies page
  - Login page
  - Signup page
  - Shared public navbar, public visual components, and auth shell/story panel
- Main responsive fixes:
  - Public navbar spacing, touch target, mobile menu rows, and very-small-screen logo tagline behavior were tightened to prevent header overflow.
  - Auth pages now render the form before the Tavro visual on mobile, while keeping the character/path panel as a compact follow-up visual.
  - Auth visual panel heights, character scale, route selector cards, and small signal cards were made mobile-aware for 320px-430px screens.
  - Signup remains Trainee Path + Company Path only; the mentor helper note stays visible after the form and no invite-code/direct mentor signup UI was reintroduced.
  - Landing hero spacing, Tavro Trail controls, GrowthMap, ReviewProofPanel, DeveloperIllustration, ConnectedSides, and PublicCta were adjusted to avoid cramped or overflowing mobile layouts.
  - Services grids, CTA buttons, workflow panels, and copy were tuned for one-column mobile layouts and Tavro Mission/Checkpoint/Opportunity terminology.
  - Companies hero, discovery trail, search/filter card, company cards, stats, and bottom CTA were adjusted for stacked mobile use and easier touch targets.
- Tradeoffs:
  - The Tavro visual identity is preserved on mobile, but heavy visuals are compressed and some trail node labels are hidden at the smallest widths to keep forms and CTAs readable.
  - Browser screenshot QA across exact device widths still needs a manual or Playwright pass because no browser binary was available in this environment.
- Build result:
  - `npm run build` passed after the responsiveness changes.
  - Non-blocking warnings remain: stale Browserslist data and large production chunk size.
- Remaining manual QA notes:
  - Manually verify `/`, `/services`, `/companies`, `/login`, and `/signup` at 320px, 360px, 375px, 390px, 430px, 768px, 1024px, and desktop widths.
  - Confirm no horizontal scroll, clipped text, or visual overlap in browser.
  - Confirm Signup still shows only Trainee Path and Company Path.
  - Confirm Login/Signup character panels remain visible but compact on mobile.
