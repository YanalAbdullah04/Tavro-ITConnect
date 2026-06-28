import { apiRequest } from "@/lib/api/client";
import type {
  AnnouncementRequest,
  SettingTrainerProfileRequest,
  StudentWithinTrainingPagedResults,
  TaskEvaluationRequest,
  TaskEvaluationsResponse,
  TrainerDashboardOverviewResponse,
  TrainerAnnouncementResponsePagedResults,
  TrainerProfileResponse,
  TrainerResponse,
  TrainerResponsePagedResults,
  TrainerTaskSubmissionsPagedResults,
  TrainingDtoInTrainerOverviewPagedResults,
  TrainingSessionDetailesResponse,
} from "@/lib/api/types";

export interface GetTrainersParams {
  SearchString?: string;
  CurentPage?: number;
  PageSize?: number;
}

export interface TrainerDashboardListParams {
  SearchString?: string;
  TrainingSessionId?: string;
  CurentPage?: number;
  PageSize?: number;
}

export interface TrainerEvaluationParams extends TrainerDashboardListParams {
  Status?: string;
  TraineeId?: string;
}

export const trainerApi = {
  getTrainers: ({ CurentPage = 1, PageSize = 5, ...params }: GetTrainersParams = {}) =>
    apiRequest<TrainerResponsePagedResults>("/api/Trainer", { method: "GET" }, { ...params, CurentPage, PageSize }),
  getTrainer: (id: string) =>
    apiRequest<TrainerProfileResponse>(`/api/Trainer/${id}`, { method: "GET" }),
  deleteTrainer: (id: string) =>
    apiRequest<void>(`/api/Trainer/${id}`, { method: "DELETE" }),
  updateTrainerManagement: (body: SettingTrainerProfileRequest) =>
    apiRequest<void>("/api/Trainer/Management", { method: "PUT", body }),
  getDashboard: () =>
    apiRequest<TrainerDashboardOverviewResponse>("/api/Trainer/Dashboard", { method: "GET" }),
  getSessions: ({ CurentPage = 1, PageSize = 6, ...params }: TrainerDashboardListParams = {}) =>
    apiRequest<TrainingDtoInTrainerOverviewPagedResults>("/api/Trainer/Sessions", { method: "GET" }, { ...params, CurentPage, PageSize }),
  getTrainees: ({ CurentPage = 1, PageSize = 8, ...params }: TrainerDashboardListParams = {}) =>
    apiRequest<StudentWithinTrainingPagedResults>("/api/Trainer/Trainees", { method: "GET" }, { ...params, CurentPage, PageSize }),
  getEvaluations: ({ CurentPage = 1, PageSize = 8, ...params }: TrainerEvaluationParams = {}) =>
    apiRequest<TrainerTaskSubmissionsPagedResults>("/api/Trainer/Evaluations", { method: "GET" }, { ...params, CurentPage, PageSize }),
  getEvaluationMeta: () =>
    apiRequest<TaskEvaluationsResponse>("/api/Trainer/Evaluations/Meta", { method: "GET" }),
  getAnnouncements: ({ CurentPage = 1, PageSize = 5, ...params }: TrainerDashboardListParams = {}) =>
    apiRequest<TrainerAnnouncementResponsePagedResults>("/api/Trainer/Announcements", { method: "GET" }, { ...params, CurentPage, PageSize }),
  createAnnouncement: (body: AnnouncementRequest) =>
    apiRequest<void>("/api/Trainer/Announcements", { method: "POST", body }),
  getTrainingSessionById: (id: string) =>
    apiRequest<TrainingSessionDetailesResponse>(`/api/Trainer/TrainingSession/${id}`, { method: "GET" }),
  evaluateTask: (taskAssignmentId: string, body: TaskEvaluationRequest) =>
    apiRequest<void>(`/api/Trainee/TaskAssignment/${taskAssignmentId}/Evaluation`, { method: "PUT", body }),
};
