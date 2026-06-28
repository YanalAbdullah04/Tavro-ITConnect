import { apiRequest } from "@/lib/api/client";
import type {
  TaskSubmissionDto,
  TaskSubmissionRequest,
  TaskSubmissionResponse,
  TaskAssigementsAndSubmissionsResponseModel,
  TraineeOverveiwDashboardResponse,
  TraineeProfileRequestAndResponse,
  TraineeTaskDetailesResponse,
} from "@/lib/api/types";

export const traineeApi = {
  getProfile: () =>
    apiRequest<TraineeProfileRequestAndResponse>("/api/Trainee/Profile", { method: "GET" }),
  updateProfile: (profile: TraineeProfileRequestAndResponse) => {
    const formData = new FormData();
    formData.append("name", profile.name);
    if (profile.phone !== null && profile.phone !== undefined) {
      formData.append("phone", profile.phone);
    }
    if (profile.portfolioLink) {
      formData.append("portfolioLink", profile.portfolioLink);
    }
    if (profile.skills) {
      formData.append("skills", profile.skills);
    }
    if (profile.imageUrl) {
      formData.append("imageUrl", profile.imageUrl);
    }
    if (profile.resumeUrl) {
      formData.append("resumeUrl", profile.resumeUrl);
    }
    if (profile.githubInstallationId !== null && profile.githubInstallationId !== undefined) {
      formData.append("githubInstallationId", String(profile.githubInstallationId));
    }
    if (profile.resumeFile) {
      formData.append("resumeFile", profile.resumeFile);
    }
    return apiRequest<void>("/api/Trainee/Profile", { method: "PUT", body: formData });
  },
  getProfileById: (id: string) =>
    apiRequest<TraineeProfileRequestAndResponse>(`/api/Trainee/Profile/${id}`, { method: "GET" }),
  getDashboard: () =>
    apiRequest<TraineeOverveiwDashboardResponse>("/api/Trainee/Dashboard", { method: "GET" }),
  getTaskDetails: (id: string) =>
    apiRequest<TraineeTaskDetailesResponse>(`/api/Trainee/TaskAssignment/${id}/Task`, { method: "GET" }),
  submitTask: (payload: TaskSubmissionRequest) =>
    apiRequest<TaskSubmissionResponse>("/api/Trainee/SubmitTask", { method: "POST", body: payload }),
  getSubmission: (taskAssignmentId: string) =>
    apiRequest<TaskSubmissionDto>(`/api/Trainee/Submission/${taskAssignmentId}`, { method: "GET" }),
  getTasksByTraineeId: (id: string) =>
    apiRequest<TaskAssigementsAndSubmissionsResponseModel>(`/api/Trainee/${id}/Tasks`, { method: "GET" }),
};
