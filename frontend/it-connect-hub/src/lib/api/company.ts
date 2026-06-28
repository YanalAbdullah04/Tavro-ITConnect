import { apiRequest } from "@/lib/api/client";
import type { CompanyResponse, CompanyTrackResponse, CompanyTraineeResponse } from "@/lib/api/types";

export const companyApi = {
  getCompanies: () =>
    apiRequest<CompanyResponse[]>("/api/Company", { method: "GET", authenticated: false }),
  getCompanyTracks: (companyId: string) =>
    apiRequest<CompanyTrackResponse[]>(`/api/Company/${companyId}/tracks`, { method: "GET", authenticated: false }),
  getCompanyTrainees: (searchQuery?: string) =>
    apiRequest<CompanyTraineeResponse[]>("/api/Company/trainees", { method: "GET" }, searchQuery ? { searchQuery } : undefined),
  deleteCompanyTrainee: (id: string) =>
    apiRequest<void>(`/api/Company/trainees/${id}`, { method: "DELETE" }),
};
