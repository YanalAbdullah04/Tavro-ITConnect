# Tavro API Integration Audit

Date: 2026-05-28

Source of truth inspected: `/home/omar/Downloads/WhatSie/api-docs.html`

The Redoc HTML contains an embedded OpenAPI 3.0.4 spec titled `ITConnect`, version `1.0`. The audit below compares that spec against the current Tavro frontend integration under `src/`. This phase is audit-only: no APIs were connected, routes were not changed, and UI terminology was not renamed.

## 1. Executive summary

- The frontend has API modules for Account, Applicant, Internship, Post, Track, Trainee, Trainer, and TrainingSession.
- The frontend is missing a GitHub API module. GitHub repository/content calls are made directly from components.
- GitHub paths in the backend docs use `/api/GitHub/...` with capital `G` and `H`; current frontend direct calls use lowercase `/api/github/...`. This is the clearest path mismatch found.
- Trainee task submission endpoints exist in the docs, but frontend calls them directly in `StudentDashboard` instead of using `traineeApi`.
- `TraineeProfileRequestAndResponse` in docs includes `githubInstallationId`; the frontend type is missing it even though GitHub code reads/writes it.
- Login docs confirm `LoginAuthResponse` does not include `userRole`; frontend must continue relying on JWT role claims unless backend changes.
- Several backend schema spellings are confirmed by docs, including `curentPage`, `InternShipDetailesResponse`, `applicatantCount`, `TraineeOverveiwDashboardResponse`, `TraineeTaskAssigenmentDto`, and `assigedAtDate`. Do not “fix” these frontend API/internal names unless backend changes.
- Docs define `GET /api/Post`, `GET /api/Track`, and `GET /api/TrainingSession` as returning a single response schema, while the UI treats these as lists and normalizes object-or-array. This needs backend behavior verification because admin tables naturally expect arrays.
- React Query is used for most module-backed flows; direct GitHub/submission fetches use local component state and manual error handling.

## 2. Endpoint inventory

| API Area | Endpoint | Method | Request / Params | Documented Response |
|---|---|---:|---|---|
| Account | `/api/Account/Register/Company` | POST | `RegisterationRequest` body | `RegistrationAuthResponse` |
| Account | `/api/Account/Register/Trainee` | POST | `RegisterationRequest` body | `RegistrationAuthResponse` |
| Account | `/api/Account/Register/Trainer` | POST | `TrainerRegistrationRequest` body | `RegistrationAuthResponse` |
| Account | `/api/Account/Trainer/profile-setting` | POST | `TrainerProfileSettingRequest` body | `RegistrationAuthResponse` |
| Account | `/api/Account/Login` | POST | `LoginDto` body | `LoginAuthResponse` |
| Account | `/api/Account/testingEmailSender` | POST | none | `LoginAuthResponse` |
| Applicant | `/api/Applicant` | GET | `SearchString`, `status`, `TrackId`, `CurentPage`, `PageSize` query params | `ApplicantResponsePagedResults` |
| Applicant | `/api/Applicant/{id}` | GET | `id` path, optional `traineeid`, `trainingsessionid` query params | array |
| Applicant | `/api/Applicant/{id}` | PUT | `id` path, `status` query param | array |
| GitHub | `/api/GitHub/callback` | GET | `installation_id`, `state` query params | 200 |
| GitHub | `/api/GitHub/test-connection` | GET | none | 200 |
| GitHub | `/api/GitHub/repositories/{traineeId}` | GET | `traineeId` path | 200, schema not specified |
| GitHub | `/api/GitHub/branches/{traineeId}/{owner}/{repoName}` | GET | `traineeId`, `owner`, `repoName` path | 200, schema not specified |
| GitHub | `/api/GitHub/content/{traineeId}/{owner}/{repoName}/{branch}` | GET | path params | 200, schema not specified |
| GitHub | `/api/GitHub/content/{traineeId}/{owner}/{repoName}/{branch}/{filePath}` | GET | path params | 200, schema not specified |
| Internship | `/api/Internship` | GET | `searchstring`, `Location`, `Track`, `currentpage`, `pagesize` query params | `InternshipResponsePagedResults` |
| Internship | `/api/Internship/{Postid}` | GET | `Postid` path UUID | `InternShipDetailesResponse` |
| Internship | `/api/Internship/{Postid}/apply` | POST | `Postid` path UUID | 200 |
| Post | `/api/Post` | GET | none | `PostResponse` |
| Post | `/api/Post` | POST | `AddPostRequest` body | 200 |
| Post | `/api/Post` | PUT | `UpdatePostRequest` body | 200 |
| Post | `/api/Post/{id}` | DELETE | `id` path UUID | 200 |
| Track | `/api/Track` | GET | none | `TrackResponse` |
| Track | `/api/Track` | POST | `AddTrackRequest` body | 200 |
| Track | `/api/Track` | PUT | `UpdateTrackRequest` body | 200 |
| Track | `/api/Track/{id}` | DELETE | `id` path UUID | 200 |
| Trainee | `/api/Trainee/Profile` | GET | none | `TraineeProfileRequestAndResponse` |
| Trainee | `/api/Trainee/Profile` | PUT | `TraineeProfileRequestAndResponse` body | `TraineeProfileRequestAndResponse` |
| Trainee | `/api/Trainee/Profile/{id}` | GET | `id` path UUID | `TraineeProfileRequestAndResponse` |
| Trainee | `/api/Trainee/Dashboard` | GET | none | `TraineeOverveiwDashboardResponse` |
| Trainee | `/api/Trainee/TaskAssignment/{id}/Task` | GET | `id` path UUID | `TraineeTaskDetailesResponse` |
| Trainee | `/api/Trainee/SubmitTask` | POST | `TaskSubmissionRequest` body | 200 |
| Trainee | `/api/Trainee/Submission/{taskAssignmentId}` | GET | `taskAssignmentId` path UUID | `TaskSubmissionDto` |
| Trainer | `/api/Trainer` | GET | `SearchString`, `CurentPage`, `PageSize` query params | `TrainerResponsePagedResults` |
| Trainer | `/api/Trainer/{id}` | GET | `id` path UUID | array |
| Trainer | `/api/Trainer/{id}` | DELETE | `id` path UUID | array |
| Trainer | `/api/Trainer/Management` | PUT | `SettingTrainerProfileRequest` body | array |
| TrainingSession | `/api/TrainingSession` | GET | none | `TrainingSessionResponse` |
| TrainingSession | `/api/TrainingSession` | POST | `CreatTrainingSessionRequest` body | 200 |
| TrainingSession | `/api/TrainingSession` | PUT | `UpdateTrainingSessionRequest` body | 200 |
| TrainingSession | `/api/TrainingSession/{id}` | DELETE | `id` path UUID | 200 |

## 3. Integration status table

| API Area | Endpoint | Method | Frontend Status | Current Location | Used By Screen | Issue | Recommended Action |
|---|---|---:|---|---|---|---|---|
| Account | `/api/Account/Register/Company` | POST | Connected | `src/lib/api/account.ts` | `src/pages/Signup.tsx` company tab | Request and response match docs. | No immediate action. |
| Account | `/api/Account/Register/Trainee` | POST | Connected | `src/lib/api/account.ts` | `src/pages/Signup.tsx` trainee tab | Request and response match docs. | No immediate action. |
| Account | `/api/Account/Register/Trainer` | POST | Partially connected | `src/lib/api/account.ts` | None found | Wrapper matches docs, but mentor signup UI does not call it. | Verify intended Tavro mentor invite/register flow before connecting. |
| Account | `/api/Account/Trainer/profile-setting` | POST | Partially connected | `src/lib/api/account.ts` | None found | Wrapper matches docs, but no screen uses it. | Add only in a later mentor onboarding phase. |
| Account | `/api/Account/Login` | POST | Connected | `src/lib/api/account.ts` | `src/pages/Login.tsx` | Docs confirm no `userRole`; UI relies on JWT claims. | Keep JWT role handling unless backend changes. |
| Account | `/api/Account/testingEmailSender` | POST | Partially connected | `src/lib/api/account.ts` | None found | Wrapper exists; no UI usage. Auth requirement not declared by docs. | Treat as internal/dev unless product requires it. |
| Applicant | `/api/Applicant` | GET | Connected | `src/lib/api/applicant.ts` | `ApplicantsManagement`, `AdminOverviewSection` | Query names match docs, including `CurentPage`. | No immediate action. |
| Applicant | `/api/Applicant/{id}` | GET | Partially connected | `src/lib/api/applicant.ts` | None found | Wrapper matches docs, but selected applicant details currently reuse list row data. | Use later if detail data is richer than list data. |
| Applicant | `/api/Applicant/{id}` | PUT | Connected | `src/lib/api/applicant.ts` | `ApplicantsManagement` | Docs confirm `status` is a query param and response is array. | No immediate action. |
| GitHub | `/api/GitHub/callback` | GET | Missing | None found | `GitHubConnect` opens GitHub App install popup | Frontend has no route/call for callback; may be backend-only. | Confirm whether callback should stay backend-only. |
| GitHub | `/api/GitHub/test-connection` | GET | Missing | None found | None found | No API wrapper or screen call. | Add later if needed for connection diagnostics. |
| GitHub | `/api/GitHub/repositories/{traineeId}` | GET | Direct fetch | `src/components/github/RepositorySelector.tsx` | Repository selector | Frontend calls `/api/github/repositories/{traineeId}` lowercase; docs use `/api/GitHub/...`. Raw response schema is undocumented. | Later add `githubApi.getRepositories` with documented casing and typed adapter. |
| GitHub | `/api/GitHub/branches/{traineeId}/{owner}/{repoName}` | GET | Missing | None found | None found | Selector only uses repository `default_branch`; real branches endpoint is unused. | Add later for actual branch selection. |
| GitHub | `/api/GitHub/content/{traineeId}/{owner}/{repoName}/{branch}` | GET | Direct fetch | `src/components/github/CodeViewer.tsx` | Code viewer directory tree | Frontend calls lowercase `/api/github/content/...`; docs use capitalized `/api/GitHub/...`. Schema is undocumented. | Centralize in GitHub API module later. |
| GitHub | `/api/GitHub/content/{traineeId}/{owner}/{repoName}/{branch}/{filePath}` | GET | Direct fetch | `src/components/github/CodeViewer.tsx` | Code viewer file/directory load | Lowercase path mismatch; `filePath` is a single path param, so encoded slash behavior needs backend verification. | Verify route encoding and add wrapper later. |
| Internship | `/api/Internship` | GET | Connected | `src/lib/api/internship.ts` | `InternshipsBrowse`, `StudentDashboard` | Query names match docs. | No immediate action. |
| Internship | `/api/Internship/{Postid}` | GET | Connected | `src/lib/api/internship.ts` | `InternshipDetails` | Path param and response type match docs, including `Postid` and `applicatantCount`. | No immediate action. |
| Internship | `/api/Internship/{Postid}/apply` | POST | Connected | `src/lib/api/internship.ts` | `InternshipDetails` | Docs confirm no request body. | No immediate action. |
| Post | `/api/Post` | GET | Needs verification | `src/lib/api/post.ts` | `PostManagement`, `AdminOverviewSection` | Docs declare `PostResponse`, not array; UI expects list and wrapper normalizes object-or-array. | Verify backend actual response. If docs are correct, admin list rendering may be wrong. |
| Post | `/api/Post` | POST | Connected | `src/lib/api/post.ts` | `PostManagement` | Request body matches docs. `PostStatus.value` is readOnly in schema but UI sends `{ value }`. | Verify backend accepts posted status despite readOnly marker. |
| Post | `/api/Post` | PUT | Connected | `src/lib/api/post.ts` | `PostManagement` | Request body matches docs. `id` is body field, not path. | No route change needed. |
| Post | `/api/Post/{id}` | DELETE | Connected | `src/lib/api/post.ts` | `PostManagement` | Path and response match docs. | No immediate action. |
| Track | `/api/Track` | GET | Needs verification | `src/lib/api/track.ts` | `TrackManagement`, admin overview/analytics, training forms | Docs declare `TrackResponse`, not array; UI expects list and wrapper normalizes object-or-array. | Verify backend actual response. |
| Track | `/api/Track` | POST | Connected | `src/lib/api/track.ts` | `TrackManagement` | Request body matches docs. | No immediate action. |
| Track | `/api/Track` | PUT | Connected | `src/lib/api/track.ts` | `TrackManagement` | Request body matches docs. `id` is body field, not path. | No route change needed. |
| Track | `/api/Track/{id}` | DELETE | Connected | `src/lib/api/track.ts` | `TrackManagement` | Path and response match docs. | No immediate action. |
| Trainee | `/api/Trainee/Profile` | GET | Connected and Direct fetch | `src/lib/api/trainee.ts`, `src/hooks/useGitHub.ts` | `StudentProfile`, GitHub connection hook | API wrapper exists, but hook bypasses it. Frontend type omits documented `githubInstallationId`. | Add field to type later and route hook through API module. |
| Trainee | `/api/Trainee/Profile` | PUT | Connected and Direct fetch | `src/lib/api/trainee.ts`, `src/hooks/useGitHub.ts` | `StudentProfile`, GitHub disconnect | Docs confirm `githubInstallationId` is legal in body, but shared type omits it. | Update type later; avoid direct fetch. |
| Trainee | `/api/Trainee/Profile/{id}` | GET | Connected and Direct fetch | `src/lib/api/trainee.ts`, `src/pages/dashboard/StudentTasks.tsx` | Admin `StudentProfile`, trainer trainee lookup | `StudentTasks` bypasses API module and has a hard-coded fallback GUID. | Later use `traineeApi.getProfileById` and remove fallback behavior carefully. |
| Trainee | `/api/Trainee/Dashboard` | GET | Connected | `src/lib/api/trainee.ts` | `StudentDashboard` | Response type matches docs, including backend spelling. | No immediate action. |
| Trainee | `/api/Trainee/TaskAssignment/{id}/Task` | GET | Connected | `src/lib/api/trainee.ts` | `TaskDetails` | Response type matches docs; `status` is documented boolean. | No immediate action, but avoid mixing with dashboard string status. |
| Trainee | `/api/Trainee/SubmitTask` | POST | Direct fetch | `src/pages/dashboard/StudentDashboard.tsx` | Repository submission | Request body matches documented `TaskSubmissionRequest`, but call bypasses API module/React Query mutation. | Later add `traineeApi.submitTask`. |
| Trainee | `/api/Trainee/Submission/{taskAssignmentId}` | GET | Direct fetch | `src/pages/dashboard/StudentDashboard.tsx` | Review code action | Docs response is `TaskSubmissionDto`. Frontend expects `githubRepoUrl`, `githubRepo`, `githubBranch`, matching docs; ignores `submittedAt`. | Later add `traineeApi.getSubmission`. |
| Trainer | `/api/Trainer` | GET | Connected | `src/lib/api/trainer.ts` | `TrainerManagement`, `TrainingManagement`, `AdminOverviewSection` | Query names and paged response match docs. | No immediate action. |
| Trainer | `/api/Trainer/{id}` | GET | Connected | `src/lib/api/trainer.ts` | `TrainerDashboard`, `TrainerProfile` | Docs response is array; frontend type is `TrainerProfileResponse[]` and reads first element where needed. | No immediate action. |
| Trainer | `/api/Trainer/{id}` | DELETE | Connected | `src/lib/api/trainer.ts` | `TrainerManagement` | Docs response is array; frontend type is `TrainerResponse[]`. | No immediate action. |
| Trainer | `/api/Trainer/Management` | PUT | Connected | `src/lib/api/trainer.ts` | `TrainerManagement` | Request body matches docs. Response is array. | No immediate action. |
| TrainingSession | `/api/TrainingSession` | GET | Needs verification | `src/lib/api/trainingSession.ts` | `TrainingManagement`, `TrainingOverview`, `TrainingSessionDetails`, admin overview/analytics | Docs declare `TrainingSessionResponse`, not array; UI expects list and wrapper normalizes object-or-array. | Verify backend actual response. |
| TrainingSession | `/api/TrainingSession` | POST | Connected | `src/lib/api/trainingSession.ts` | `TrainingManagement` | Request body matches docs, including `CreatTrainingSessionRequest`. | No immediate action. |
| TrainingSession | `/api/TrainingSession` | PUT | Connected | `src/lib/api/trainingSession.ts` | `TrainingManagement` | Request body matches docs. `id` is body field, not path. | No route change needed. |
| TrainingSession | `/api/TrainingSession/{id}` | DELETE | Connected | `src/lib/api/trainingSession.ts` | `TrainingManagement` | Path and response match docs. | No immediate action. |

## 4. Direct fetch calls found

Centralized `fetch` inside `src/lib/api/client.ts` is expected. These direct API calls bypass that client:

| Location | Endpoint called | Docs endpoint | Purpose | Issue |
|---|---|---|---|---|
| `src/hooks/useGitHub.ts` | `/api/Trainee/Profile` | `/api/Trainee/Profile` | Detect GitHub install state. | Bypasses `traineeApi`; duplicate auth/error handling. |
| `src/hooks/useGitHub.ts` | `/api/Trainee/Profile` GET then PUT | `/api/Trainee/Profile` | Disconnect GitHub by nulling `githubInstallationId`. | Docs allow field, but frontend shared type omits it. |
| `src/components/github/RepositorySelector.tsx` | `/api/github/repositories/{traineeId}` | `/api/GitHub/repositories/{traineeId}` | Load repos. | Lowercase path mismatch; no API module; raw schema undocumented. |
| `src/components/github/CodeViewer.tsx` | `/api/github/content/{...}` | `/api/GitHub/content/{...}` | Load tree/content. | Lowercase path mismatch; no API module; `filePath` encoding uncertain. |
| `src/pages/dashboard/StudentDashboard.tsx` | `/api/Trainee/Submission/{taskAssignmentId}` | `/api/Trainee/Submission/{taskAssignmentId}` | Load submitted repository metadata. | Direct fetch; should be typed as `TaskSubmissionDto`. |
| `src/pages/dashboard/StudentDashboard.tsx` | `/api/Trainee/SubmitTask` | `/api/Trainee/SubmitTask` | Submit repository. | Direct fetch; should be a React Query mutation via API module. |
| `src/pages/dashboard/StudentTasks.tsx` | `/api/Trainee/Profile/{traineeId}` | `/api/Trainee/Profile/{id}` | Trainer trainee lookup. | Direct fetch; hard-coded fallback GUID. |

Other searches:

- `axios`: no usage found.
- `api.get`, `api.post`, `api.put`, `api.patch`, `api.delete`: no usage found.
- `/api/` usage is otherwise concentrated in API modules.

## 5. Missing API modules

- Missing `src/lib/api/github.ts` for:
  - `GET /api/GitHub/callback`
  - `GET /api/GitHub/test-connection`
  - `GET /api/GitHub/repositories/{traineeId}`
  - `GET /api/GitHub/branches/{traineeId}/{owner}/{repoName}`
  - `GET /api/GitHub/content/{traineeId}/{owner}/{repoName}/{branch}`
  - `GET /api/GitHub/content/{traineeId}/{owner}/{repoName}/{branch}/{filePath}`
- Missing `traineeApi.submitTask` for `POST /api/Trainee/SubmitTask`.
- Missing `traineeApi.getSubmission` for `GET /api/Trainee/Submission/{taskAssignmentId}`.

## 6. Type mismatches or uncertain schemas

Confirmed by docs:

- `TraineeProfileRequestAndResponse` should include `githubInstallationId?: number | null`; frontend type currently does not.
- `LoginAuthResponse` intentionally has no `userRole`; frontend JWT role claim handling is necessary.
- `TaskSubmissionRequest` fields match current submission body: `taskAssignmentId`, `githubRepo`, `githubBranch`, `githubCommitSha`, `githubRepoUrl`.
- `TaskSubmissionDto` fields match current review-code usage: `githubRepo`, `githubBranch`, `githubRepoUrl`, plus `submittedAt`.
- Applicant update status is documented as a query parameter, not a JSON body.
- Backend spellings in current frontend types are mostly doc-accurate: `RegisterationRequest`, `CreatTrainingSessionRequest`, `curentPage`, `InternShipDetailesResponse`, `applicatantCount`, `TraineeOverveiwDashboardResponse`, `TraineeTaskAssigenmentDto`, `assigedAtDate`.

Needs verification despite docs:

- Docs say `GET /api/Post` returns `PostResponse`, `GET /api/Track` returns `TrackResponse`, and `GET /api/TrainingSession` returns `TrainingSessionResponse`, but frontend screens use them as list endpoints. The wrappers normalize a single object into a one-item array, which may hide a doc/backend mismatch.
- GitHub responses are documented only as `200` without schemas, so frontend mappings for repository fields, branches, directory entries, and file content are inferred.
- `PostStatus.value` and `ApplicantStatus.value` are marked `readOnly`, but the frontend sends `PostStatus` in Post create/update and sends Applicant status as query string. Applicant status query is doc-backed; Post status body acceptance should be tested.
- `TraineeTaskDetailesResponse.status` is boolean, while dashboard task assignment status is string. Both match docs in their own contexts, but UI code should avoid treating them as interchangeable.
- GitHub `filePath` is a path parameter, but nested repository paths contain slashes. The current encoded-single-segment approach needs backend route verification.

## 7. Existing flows that appear working

- Company and trainee registration use documented request/response types through `accountApi`.
- Login uses documented `LoginDto` and `LoginAuthResponse`; role is resolved from JWT claims because docs do not return `userRole` on login.
- Candidate list and status update use documented Applicant params.
- Opportunity browse/detail/apply use documented Internship endpoints and params.
- Opportunity create/update/delete request bodies match documented Post DTOs.
- Track create/update/delete request bodies match documented Track DTOs.
- Trainee dashboard, profile, profile-by-id, and task details match documented Trainee schemas.
- Trainer list/detail/delete/management endpoints match documented response shape expectations, including array responses for detail/delete/update.
- TrainingSession create/update/delete request bodies match documented DTOs.
- Most module-backed flows use React Query with loading/error states and cache invalidation after mutations.

## 8. Existing flows that need verification

- GitHub integration path casing: frontend lowercase `/api/github/...` vs docs capitalized `/api/GitHub/...`.
- GitHub app install flow: `GitHubConnect` opens `https://github.com/apps/itconnect-local/installations/new?state={traineeId}` and listens for `postMessage`; docs only expose backend callback query params.
- GitHub test connection endpoint is unused.
- GitHub branches endpoint is unused; current UI only uses repository default branch.
- GitHub repository/content/file response schemas are undocumented and currently inferred with `any`.
- `GET /api/Post`, `GET /api/Track`, and `GET /api/TrainingSession` list behavior needs backend verification because docs show single-object schemas.
- `StudentTasks` trainer view uses localStorage submissions and a hard-coded fallback trainee GUID.
- `PostManagement` sends `status: { value }` even though `PostStatus.value` is readOnly in docs.

## 9. Suggested integration priority

1. Fix audit-blocking path mismatch first in the next phase: centralize GitHub calls and use documented `/api/GitHub/...` casing.
2. Add `src/lib/api/github.ts` for repositories, branches, content, test connection, and any frontend-relevant callback helper.
3. Add `submitTask` and `getSubmission` to `src/lib/api/trainee.ts`.
4. Add `githubInstallationId` to `TraineeProfileRequestAndResponse`.
5. Replace direct fetch calls in GitHub/submission/trainee lookup flows with API module methods.
6. Verify actual backend behavior for `GET /api/Post`, `GET /api/Track`, and `GET /api/TrainingSession`; update wrapper return types only after confirming runtime behavior.
7. Use the documented branches endpoint to populate branch selection instead of only `default_branch`.
8. Reduce localStorage reliance for submission status once backend submission/dashboard state is the source of truth.

## 10. Risks / warnings

- Do not rename backend endpoints, DTOs, route params, or internal API types for Tavro terminology in this phase.
- GitHub casing may be harmless on some development hosts but unsafe on case-sensitive routing/proxies.
- Direct fetch calls miss `apiRequest` behavior: consistent JSON parsing, `ApiError`, and 401 session clearing/redirect.
- LocalStorage keys such as `submitted_repo_{traineeId}_{taskId}` and `task_status_{traineeId}_{taskId}` can diverge from backend submission state.
- Hard-coded GitHub values remain: `itconnect-local`, `YanalAbdullah04`, fallback owner/avatar values.
- Redoc docs title still says `ITConnect`; Tavro branding is frontend terminology only and should not drive API renames.
- OpenAPI schemas for GitHub responses are absent, so a typed integration will need either backend schema updates or careful runtime inspection.

## 11. Recommended next phases

Phase 1: API module completion

- Add GitHub and trainee submission API methods using the documented paths.
- Keep current behavior and route structure.
- Add narrow response types where docs are explicit; use conservative unknown/adapters where GitHub schemas are missing.

Phase 2: Direct fetch migration

- Replace direct fetches in `useGitHub`, `RepositorySelector`, `CodeViewer`, `StudentDashboard`, and `StudentTasks`.
- Preserve UI and auth behavior while gaining centralized error handling.

Phase 3: Runtime contract verification

- Test `GET /api/Post`, `GET /api/Track`, and `GET /api/TrainingSession` against the backend to resolve single-object vs list behavior.
- Test GitHub casing and filePath encoding with nested files.
- Test Post create/update status handling.

Phase 4: Data-source cleanup

- Move mission submission status away from localStorage once backend data is confirmed.
- Replace hard-coded GitHub and trainee fallback values with backend-driven values.
- Consider asking backend to document GitHub response schemas in OpenAPI.

## Phase 2 Changes

- Added `src/lib/api/github.ts` with API-layer methods for the documented `/api/GitHub/...` endpoints: test connection, repositories, branches, root content, and content by path.
- Added conservative GitHub response types and normalizers because the OpenAPI export documents GitHub responses as plain `200` without schemas.
- Added `traineeApi.submitTask` for `POST /api/Trainee/SubmitTask` and `traineeApi.getSubmission` for `GET /api/Trainee/Submission/{taskAssignmentId}`.
- Added documented `TaskSubmissionRequest` and `TaskSubmissionDto` types.
- Added `githubInstallationId?: number | null` to `TraineeProfileRequestAndResponse`.
- Left existing direct fetch call sites in `useGitHub`, `RepositorySelector`, `CodeViewer`, `StudentDashboard`, and `StudentTasks` intentionally unmigrated for Phase 3.
- TODO: Runtime-test GitHub nested file path routing because `filePath` is documented as a single route segment and repository paths can contain slashes.

## Phase 3 Changes

- Migrated `src/hooks/useGitHub.ts` profile GET/PUT calls to `traineeApi.getProfile` and `traineeApi.updateProfile`.
- Migrated `src/components/github/RepositorySelector.tsx` repository loading to `githubApi.getRepositories`, using documented `/api/GitHub/...` casing through the API module.
- Migrated `src/components/github/CodeViewer.tsx` repository content loading to `githubApi.getContent` and `githubApi.getContentByPath`.
- Migrated `src/pages/dashboard/StudentDashboard.tsx` submission lookup/save calls to `traineeApi.getSubmission` and `traineeApi.submitTask`.
- Migrated `src/pages/dashboard/StudentTasks.tsx` trainee profile lookup to `traineeApi.getProfileById` and removed the silent hard-coded fallback trainee GUID.
- Preserved existing localStorage submission fallback in the trainee workspace to avoid breaking old/demo submission state; future cleanup should make backend submission/dashboard state authoritative.
- Remaining direct `fetch(` usage should be the centralized API client only.
- TODO: Runtime-test nested GitHub filePath routing with backend and verify GitHub response shapes because the OpenAPI export does not define schemas for those endpoints.

## Phase 4 Backend Contract Sync

- Backend source confirms `GET /api/Post`, `GET /api/Track`, and `GET /api/TrainingSession` return lists through service/repository methods even though Swagger/Redoc shows single-object response schemas. Frontend wrappers keep normalization for compatibility, with comments noting the real list contract.
- Backend source adds mentor/trainer endpoints not present in the original Redoc audit detail: `GET /api/Trainer/Dashboard` and `GET /api/Trainer/TrainingSession/{id}`. Frontend now has API methods ready for future Mentor Workspace integration.
- Backend source confirms `GET /api/Trainee/{id}/Tasks` for trainer access to trainee task/submission data. Frontend now has `traineeApi.getTasksByTraineeId`.
- Backend source shows `GET /api/Trainer/{id}` is effectively a single-profile endpoint despite list-shaped controller/OpenAPI typing. Frontend keeps `trainerApi.getTrainer` normalized to an array to preserve existing call sites.
- Backend source confirms `POST /api/TrainingSession/{id}/Task` with `[FromForm] AssignTaskRequest`, including `TaskTitle`, `Description`, `Notes`, `Deadline`, optional `Attachment`, `TraineesId`, and `IncludeAll`. Frontend now has `trainingSessionApi.createTaskForSession`, and the API client supports `FormData` without forcing JSON `Content-Type`.
- Backend GitHub controller uses `GET /api/GitHub/content/{traineeId}/{owner}/{repoName}/{branch}/{*filePath}`. Frontend `githubApi.getContentByPath` now preserves nested slashes for the catch-all route while encoding each path segment.
- Backend GitHub repository, branch, and content endpoints proxy raw GitHub JSON, so response schemas still need runtime verification and/or backend OpenAPI schema improvements.
- Backend mentor onboarding is not invite-code based. Current flow is company-created trainer account, backend-generated email link to `/profile-setting?token={jwt}`, then `POST /api/Account/Trainer/profile-setting` under trainer JWT auth. Do not connect the current visual email+invite-code UI to a fake endpoint; a true invite-code flow would require backend work.
- Backend `TraineeService.UpdateTraineeProfileAsync` currently updates name, portfolio, resume, image, and skills, but does not persist phone or `githubInstallationId` changes through the profile update path. GitHub callback persists installation ID separately. Frontend disconnect behavior should be revisited before treating profile PUT as authoritative for GitHub disconnect.
- Swagger/backend mismatch remains mostly documentation-level for list endpoints and GitHub schemas. Frontend API layer now follows actual backend routes while preserving existing UI behavior.

## Phase 5A Mentor Workspace Integration

- Integrated `GET /api/Trainer/Dashboard` into `src/pages/dashboard/TrainerDashboard.tsx` as the primary source for assigned sessions, active trainee count, pending checkpoint count, and assigned session rows.
- Integrated `GET /api/Trainer/TrainingSession/{id}` into the Mentor Workspace and `src/pages/dashboard/TrainingSessionDetails.tsx` for session details, trainee roster, per-trainee mission counts, session date range, and mission totals.
- Integrated `GET /api/Trainee/{id}/Tasks` into `src/pages/dashboard/StudentTasks.tsx` for trainee mission lists, status, deadline, submitted date, submitted repository, branch, repo URL, feedback, and grade when present.
- Kept `GET /api/Trainer/{id}` as a secondary/fallback source for mentor profile/contact details and legacy profile-derived session/trainee data when dashboard/session detail fields are unavailable.
- Updated visible Mentor Workspace language toward Tavro terminology: Mentor Workspace, Review Command Center, Trainee Missions, Mission Queue, and Mentor Checkpoints.
- Preserved honest fallback values: unavailable mission/checkpoint counts show `—`, empty sessions/trainees/missions use Tavro empty states, and profile/session fields fall back to unavailable labels rather than invented values.
- No large mission creation UI exists in the Mentor Workspace, so `POST /api/TrainingSession/{id}/Task` remains API-layer ready but intentionally unconnected in this phase.
- Backend still lacks a confirmed submit-review, feedback-decision, approve, or reject endpoint for mission submissions. The UI does not fake review actions or feedback success; it only exposes available session, trainee, mission, and repository signals.
- TODO: Add a real Mentor Checkpoint submission flow only after backend review/feedback endpoints are available.
- TODO: Runtime-test whether `PendingEvaluationsCount` represents submitted missions, unevaluated assigned missions, or another backend status interpretation before presenting it as a strict review queue.

## Phase 5B Trainee Workspace Integration

- Integrated `GET /api/Trainee/Dashboard` more fully in `src/pages/dashboard/StudentDashboard.tsx` as the primary source for training/session state, assigned missions, mentor identity, announcements, and path summary signals.
- Added backend-first submission state per mission through `GET /api/Trainee/Submission/{taskAssignmentId}`. Backend submission data now wins for submitted repository, branch, URL, and submitted date; localStorage remains only as a compatibility/demo fallback.
- Kept `POST /api/Trainee/SubmitTask` through `traineeApi.submitTask` for repository submission, and invalidates/refetches trainee dashboard, submission, and mission detail queries after successful submit.
- Used `GET /api/Trainee/TaskAssignment/{id}/Task` for the current mission card when available, adding backend mission deadline and description without inventing progress data.
- Continued using `GET /api/Trainee/Profile`/`PUT /api/Trainee/Profile` through `useGitHub` for GitHub connection detection with `githubInstallationId`; disconnect remains visually available because it already existed, but backend persistence remains uncertain.
- Continued using `GET /api/Internship` for trainee opportunity preview and browse flows; visible trainee copy now favors Opportunity terminology.
- Updated trainee-visible copy toward Tavro terms: My Growth Path, Current Mission, GitHub Submit, Mentor Checkpoint, Growth Signal, Explore Opportunities, and Trainee Workspace.
- Preserved localStorage fallback keys `submitted_repo_{traineeId}_{taskId}` and `task_status_{traineeId}_{taskId}` to avoid breaking old/demo submission state. TODO: remove once backend submission/dashboard state is stable across demos.
- Backend still does not expose trainee-facing checkpoint feedback/approval/rejection fields on `TaskSubmissionDto`, so the UI shows honest waiting/locked states instead of fake feedback or approval.
- TODO: Add true Growth Signal and Mentor Checkpoint data when backend exposes review/feedback/progress fields.
- TODO: Runtime-test GitHub disconnect because backend profile update currently may not persist `githubInstallationId: null`.

## Phase 5C Company Workspace Signals

- Integrated company overview signals in `src/components/dashboard/admin/sections/AdminOverviewSection.tsx` using existing API modules for `GET /api/Track`, `GET /api/TrainingSession`, `GET /api/Trainer`, `GET /api/Post`, and `GET /api/Applicant`.
- Updated overview quick actions in `src/components/dashboard/admin/AdminLayout.tsx` to use existing company routes only: Create Track, New Session, Manage Mentors, Publish Opportunity, and View Candidates.
- Mapped signal cards from real fields: track count, session count, mentor `totalCount`, session `registeredStudentsCount`, post/opportunity count, and applicant/candidate `totalCount`.
- Added Training Operations Flow using real counts: Growth Tracks → Sessions → Mentors → Trainees → Opportunities → Candidates.
- Added Capacity Overview chart from `TrainingSessionResponse.registeredStudentsCount` and `seatsNumber`, deriving available seats as `seatsNumber - registeredStudentsCount`.
- Added Candidate Status chart from loaded `ApplicantResponse.status.value` records. The overview requests up to 100 candidates for this signal; if the backend has more than 100, the chart is a loaded-sample view while the card still uses `totalCount`.
- Added Opportunity Status chart from `PostResponse.status.value`.
- Added/refined Active Capacity, Growth Tracks, and Candidate Pipeline panels with Tavro empty states and actions to existing management routes.
- Intentionally did not add company GitHub repository review, code review, mentor feedback, or trainee submission approval/rejection workflows; those remain Mentor/Trainee workflow concerns.
- Fallback behavior: unavailable/error counts show `-`, loading counts show `...`, empty charts render honest empty states, and missing status values group under `Unknown`.
- TODO: Add a Sessions by Track chart later if the overview needs deeper track-level distribution; current Growth Tracks panel already shows backend-provided session and trainee counts by track.

## Mentor Onboarding UI Alignment

- Removed the public Mentor Path/signup option from `src/pages/Signup.tsx` and `src/components/public/TavroAuth.tsx`; public signup now exposes only Trainee Path and Company Path.
- Removed the public email + invite-code mentor form because the backend does not implement invite-code verification.
- Preserved existing trainee and company signup behavior through `POST /api/Account/Register/Trainee` and `POST /api/Account/Register/Company`.
- Added company-side Invite Mentor UI in `src/components/admin/TrainerManagement.tsx` with full name, email, phone number, and optional specialization fields.
- The Invite Mentor action uses the backend-confirmed `POST /api/Account/Register/Trainer` endpoint through `accountApi.inviteMentor`.
- `accountApi.inviteMentor` uses the current authenticated company session but does not call `setAuthSession`, write auth localStorage, redirect, or log in as the invited mentor; this avoids replacing the company token with any token returned by the backend.
- Successful invites refetch the mentors list and show the backend email-link flow message: the mentor receives a profile setup link to complete their Tavro profile.
- The invite-code flow remains intentionally unimplemented until a real backend endpoint exists.
- Profile-setting API support remains in `accountApi.setTrainerProfile` for `POST /api/Account/Trainer/profile-setting`. No existing `/profile-setting` frontend route/page was found in the current codebase during this pass, so no profile-setting route was changed.

## Phase 6 Runtime QA

- Created `WORKSPACE_RUNTIME_QA.md` with build, preview, public route, static terminology, onboarding, auth, workspace, API/runtime, fixes, and readiness findings.
- `npm run build` passed. Non-blocking warnings remain: stale Browserslist data and a large production JS chunk.
- `npm run preview -- --host 127.0.0.1 --port 4173` passed after local preview port binding was allowed; public routes returned HTTP 200 through Vite preview.
- Backend reachability was confirmed with local HTTP checks, but credentialed role/workspace API QA was blocked because the demo account values provided in the prompt were placeholders rather than usable credentials.
- Signup mentor removal was verified through source and built bundle checks: public signup exposes Trainee Path and Company Path only, with no Mentor Path, invite-code field, or direct trainer registration copy.
- Invite Mentor was source-verified in the Company Workspace Mentors page: it uses `POST /api/Account/Register/Trainer` through `accountApi.inviteMentor`, does not call `setAuthSession`, and refetches mentors after success. Runtime mutation testing remains blocked until a real company demo account and safe demo email are available.
- A remaining blocker was documented: the backend email-link flow targets `/profile-setting?token={jwt}`, but no frontend `/profile-setting` route/page is currently registered in `src/App.tsx`.
- Safe terminology fixes applied during QA: public landing/Tavro path copy now uses Mission/Checkpoint/Opportunity language where it previously showed Task/Review/Internship wording, and navbar labels now match `Login` and `Get Started`.
- TODO: rerun browser-based runtime QA with real demo credentials, verify console/network behavior, test protected workspace APIs, and add/restore the profile-setting route/page before declaring production runtime readiness.
