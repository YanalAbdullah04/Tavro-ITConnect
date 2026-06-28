import { apiRequest } from "@/lib/api/client";
import type { AddTrackRequest, TrackResponse, UpdateTrackRequest } from "@/lib/api/types";

export const trackApi = {
  getTracks: () => apiRequest<TrackResponse[]>("/api/Track", { method: "GET" }),
  createTrack: (body: AddTrackRequest) =>
    apiRequest<void>("/api/Track", { method: "POST", body }),
  updateTrack: (body: UpdateTrackRequest) =>
    apiRequest<void>("/api/Track", { method: "PUT", body }),
  deleteTrack: (id: string) =>
    apiRequest<void>(`/api/Track/${id}`, { method: "DELETE" }),
};
