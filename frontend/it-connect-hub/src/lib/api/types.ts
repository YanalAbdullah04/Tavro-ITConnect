export interface RegisterationRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface TraineeRegistrationRequest extends RegisterationRequest {
  githubUsername: string;
}

export interface TrainerRegistrationRequest {
  fullName: string;
  email: string;
  phone: string;
  specialization?: string | null;
}

export interface TrainerProfileSettingRequest {
  password: string;
  gitHubAccount?: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegistrationAuthResponse {
  isSuccess: boolean;
  token?: string | null;
  expiration?: string | null;
  userRole?: string | null;
  errors?: string[] | null;
}

export interface LoginAuthResponse {
  isSuccess: boolean;
  token?: string | null;
  expiration?: string | null;
  errors?: string[] | null;
}

export type ApplicantStatus = "Pending" | "Interviewed" | "Accepted" | "Rejected";

export interface ApplicantResponse {
  applicantId: string;
  traineeId: string;
  traineeName: string;
  traineeEmail: string;
  trainingSessionId: string;
  status: ApplicantStatus;
  createdAt: string;
  trackId: string;
  trackName: string;
}

export interface ApplicantResponseDetailes {
  trainingSessionId: string;
  traineeName: string;
  email: string;
  phoneNumber: string;
  trackName: string;
  trainingSessionTitle: string;
  applicationDate: string;
  skills?: string | null;
  status: ApplicantStatus;
  resumeUrl?: string | null;
  portfolioLink?: string | null;
}

export interface ApplicantResponsePagedResults {
  items?: ApplicantResponse[] | null;
  totalCount: number;
  curentPage: number;
  pageSize: number;
  totalPages: number;
  havePreviousPage: boolean;
  haveNextPage: boolean;
}

export interface InternshipResponse {
  postId: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  companyName: string;
  numberOfApplicant: number;
  applied: boolean;
}

export interface InternshipResponsePagedResults {
  items?: InternshipResponse[] | null;
  totalCount: number;
  curentPage: number;
  pageSize: number;
  totalPages: number;
  havePreviousPage: boolean;
  haveNextPage: boolean;
}

export interface InternShipDetailesResponse {
  title: string;
  location: string;
  companyName: string;
  startDate: string;
  endDate: string;
  reqSkills: string;
  responsibility: string;
  benefits: string;
  trainingSessionId: string;
  applicatantCount: number;
  applied: boolean;
}

export type PostStatus = "Pending" | "Published" | "Unpublished";

export interface PostResponse {
  id: string;
  title: string;
  description: string;
  deadline: string;
  reqSkills: string;
  responsibility: string;
  benefits?: string | null;
  status: PostStatus;
  trainingSessionId: string;
  numberOfApplicants: number;
}

export interface AddPostRequest {
  title: string;
  description: string;
  deadline: string;
  reqSkills: string;
  responsibility: string;
  benefits?: string | null;
  status?: PostStatus | null;
  trainingSessionId: string;
}

export interface UpdatePostRequest {
  id: string;
  status?: PostStatus | null;
  title: string;
  description: string;
  deadline: string;
  reqSkills: string;
  responsibility: string;
  benefits?: string | null;
  trainingSessionId: string;
}

export interface TrackResponse {
  id: string;
  name: string;
  description: string;
  numberOfTrainings: number;
  numberOfTrainees: number;
}

export interface AddTrackRequest {
  name: string;
  description: string;
}

export interface UpdateTrackRequest {
  id: string;
  name: string;
  description: string;
}

export interface TraineeProfileRequestAndResponse {
  name: string;
  phone: string | null;
  portfolioLink?: string | null;
  skills?: string | null;
  resumeUrl?: string | null;
  imageUrl?: string | null;
  githubInstallationId?: number | null;
  githubUsername?: string | null;
  resumeFile?: File | null;
}

export type TraineeTaskStatus = "Pending" | "Submitted" | "Completed";

export interface TraineeTaskAssigenmentDto {
  taskAssignmentId: string;
  taskTitle: string;
  status: TraineeTaskStatus;
  assigedAtDate: string;
  feedback?: string | null;
  grad?: string | null;
}

export interface TraineeAnnouncementDto {
  announcementId: string;
  title: string;
  message?: string | null;
  createdAt?: string | null;
}

export interface TraineeOverveiwDashboardResponse {
  trainerName?: string | null;
  trainerGitHubAccount?: string | null;
  trainingSessionTitle?: string | null;
  startDate: string | null;
  endDate: string | null;
  traineeTaskAssigenmentDtos: TraineeTaskAssigenmentDto[];
  traineeAnnouncementDtos: TraineeAnnouncementDto[];
}

export interface TraineeTaskDetailesResponse {
  title: string;
  description: string;
  notes: string;
  assignedAt: string;
  deadline: string;
  attachmentUrl?: string | null;
  trainingSessionId: string;
  trainerName: string;
  status: boolean;
}

export interface TaskSubmissionRequest {
  taskAssignmentId: string;
  githubRepo: string;
  githubBranch: string;
  githubCommitSha?: string | null;
  githubRepoUrl: string;
}

export interface TaskSubmissionDto {
  githubRepo: string;
  githubBranch: string;
  githubRepoUrl: string;
  submittedAt: string;
}

export interface TaskSubmissionResponse {
  message: string;
}

export interface TaskEvaluationRequest {
  feedback?: string | null;
  grade?: string | null;
}

export interface TrainerResponse {
  userId: string;
  trainerName: string;
  specialization: string | null;
  phone: string | null;
  email: string | null;
  trainingSessionsCount: number;
  countStudents: number;
}

export interface TrainerResponsePagedResults {
  items?: TrainerResponse[] | null;
  totalCount: number;
  curentPage: number;
  pageSize: number;
  totalPages: number;
  havePreviousPage: boolean;
  haveNextPage: boolean;
}

export interface TrainingSummaryDto {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  studentCount: number;
}

export interface TraineeUnderTrainerDto {
  studentName: string;
  trainingTitle: string;
}

export interface TrainerProfileResponse {
  id: string;
  name: string;
  specialty: string | null;
  email: string | null;
  phone: string | null;
  gitHubAccount: string | null;
  totalStudentsCount: number;
  totalTrainingsCount: number;
  totalTasksCount: number;
  trainingsList: TrainingSummaryDto[];
  studentsList: TraineeUnderTrainerDto[];
}

export interface TrainingDtoInTrainerOverview {
  id: string;
  name: string;
  totalStudents: number;
  startDate?: string | null;
  endDate?: string | null;
  taskCount?: number | null;
}

export interface TrainerDashboardOverviewResponse {
  assigingStudentsCount: number;
  totalTraningCount: number;
  pendingEvaluationsCount: number;
  trainingDto: TrainingDtoInTrainerOverview[];
}

export interface StudentWithinTraining {
  studentId: string;
  studentName: string;
  email: string | null;
  trainingId?: string | null;
  trainingTitle?: string | null;
  numberOfTasks: number;
}

export interface TrainingSessionDetailesResponse {
  trainingSessionName: string;
  startDate: string;
  endDate: string;
  studentsWithinTraining: StudentWithinTraining[];
  numberOfStudents: number;
  taskCount: number;
}

export type TrainerTaskSubmissionStatus = "Pending" | "Submitted" | "Evaluated";

export interface TrainerTaskSubmissionsDto {
  taskAssignmentId: string;
  taskTitle: string;
  status: TrainerTaskSubmissionStatus;
  traineeId?: string | null;
  traineeName?: string | null;
  traineeEmail?: string | null;
  trainingSessionId?: string | null;
  trainingSessionName?: string | null;
  deadline?: string | null;
  submittedAt?: string | null;
  feedback?: string | null;
  grade?: string | null;
  githubRepo?: string | null;
  githubBranch?: string | null;
  githubRepoUrl?: string | null;
  githubOwner?: string | null;
}

export interface TaskAssigementsAndSubmissionsResponseModel {
  trainerTaskSubmissionsDtos: TrainerTaskSubmissionsDto[];
}

export interface TrainingDtInEvaluationResponseo {
  trainingSessionId: string;
  trainingSessionName: string;
}

export interface TraineeDtoInEvaluationResponse {
  traineeId: string;
  traineeName: string;
}

export interface TaskEvaluationsResponse {
  trainees: TraineeDtoInEvaluationResponse[];
  trainings: TrainingDtInEvaluationResponseo[];
  pendingEvaluations: number;
  evaluated: number;
}

export interface TrainerTaskSubmissionsPagedResults {
  items?: TrainerTaskSubmissionsDto[] | null;
  totalCount: number;
  curentPage: number;
  pageSize: number;
  totalPages: number;
  havePreviousPage: boolean;
  haveNextPage: boolean;
}

export interface TrainingDtoInTrainerOverviewPagedResults {
  items?: TrainingDtoInTrainerOverview[] | null;
  totalCount: number;
  curentPage: number;
  pageSize: number;
  totalPages: number;
  havePreviousPage: boolean;
  haveNextPage: boolean;
}

export interface StudentWithinTrainingPagedResults {
  items?: StudentWithinTraining[] | null;
  totalCount: number;
  curentPage: number;
  pageSize: number;
  totalPages: number;
  havePreviousPage: boolean;
  haveNextPage: boolean;
}

export interface TrainerAnnouncementResponse {
  announcementId: string;
  trainingSessionId: string;
  trainingSessionName: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface TrainerAnnouncementResponsePagedResults {
  items?: TrainerAnnouncementResponse[] | null;
  totalCount: number;
  curentPage: number;
  pageSize: number;
  totalPages: number;
  havePreviousPage: boolean;
  haveNextPage: boolean;
}

export interface AnnouncementRequest {
  trainingSessionId: string;
  title: string;
  message: string;
}

export interface SettingTrainerProfileRequest {
  trainerId: string;
  name: string;
  email: string;
  phone: string;
  specialization?: string | null;
  githubUsername?: string | null;
  imgUrl?: string | null;
}

export interface TrainingSessionResponse {
  id: string;
  trainingSessionName: string;
  description: string;
  isPaid: boolean;
  location: string;
  startDate: string;
  endDate: string;
  seatsNumber: number;
  trainingStatus: string;
  trackId: string;
  trackName: string;
  trainerId: string;
  trainerName: string;
  registeredStudentsCount: number;
}

export interface CreatTrainingSessionRequest {
  name: string;
  description: string;
  isPaid: boolean;
  location: string;
  startDate: string;
  endDate: string;
  seatsNumber: number;
  trackId: string;
  trainerId: string;
}

export interface UpdateTrainingSessionRequest {
  id: string;
  name: string;
  description: string;
  isPaid: boolean;
  trainingStatus: string;
  location: string;
  startDate: string;
  endDate: string;
  seatsNumber: number;
  trackId: string;
  trainerId: string;
}

export interface AssignTaskRequest {
  taskTitle: string;
  description: string;
  notes?: string | null;
  deadline: string;
  attachment?: File | Blob | null;
  traineesId?: string[] | null;
  includeAll: boolean;
}

export interface CompanyResponse {
  companyId: string;
  name: string;
  email: string;
  description: string;
  location: string;
  numberOfTracks: number;
}

export interface CompanyTrackResponse {
  id: string;
  name: string;
  description: string;
  companyId: string;
}

export interface CompanyTraineeResponse {
  id: string;
  name: string;
  email: string;
  trainingSessionName: string;
}
