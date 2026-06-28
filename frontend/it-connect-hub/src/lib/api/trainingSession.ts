import { apiRequest } from "@/lib/api/client";
import type {
  AssignTaskRequest,
  CreatTrainingSessionRequest,
  TrainingSessionResponse,
  UpdateTrainingSessionRequest,
} from "@/lib/api/types";

function appendIfPresent(formData: FormData, key: string, value: string | number | boolean | Blob | null | undefined) {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, value instanceof Blob ? value : String(value));
  }
}

function toAssignTaskFormData(payload: AssignTaskRequest | FormData) {
  if (payload instanceof FormData) return payload;

  const formData = new FormData();
  appendIfPresent(formData, "TaskTitle", payload.taskTitle);
  appendIfPresent(formData, "Description", payload.description);
  appendIfPresent(formData, "Notes", payload.notes);
  appendIfPresent(formData, "Deadline", payload.deadline);
  appendIfPresent(formData, "IncludeAll", payload.includeAll);
  appendIfPresent(formData, "Attachment", payload.attachment);
  payload.traineesId?.forEach((traineeId) => appendIfPresent(formData, "TraineesId", traineeId));
  return formData;
}

export const trainingSessionApi = {
  getTrainingSessions: () => apiRequest<TrainingSessionResponse[]>("/api/TrainingSession", { method: "GET" }),
  createTrainingSession: (body: CreatTrainingSessionRequest) =>
    apiRequest<void>("/api/TrainingSession", { method: "POST", body }),
  updateTrainingSession: (body: UpdateTrainingSessionRequest) =>
    apiRequest<void>("/api/TrainingSession", { method: "PUT", body }),
  deleteTrainingSession: (id: string) =>
    apiRequest<void>(`/api/TrainingSession/${id}`, { method: "DELETE" }),
  createTaskForSession: (sessionId: string, payload: AssignTaskRequest | FormData) =>
    apiRequest<void>(`/api/TrainingSession/${sessionId}/Task`, { method: "POST", body: toAssignTaskFormData(payload) }),
};
