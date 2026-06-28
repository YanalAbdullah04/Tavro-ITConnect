import { apiRequest } from "@/lib/api/client";
import type { ApplicantResponseDetailes, ApplicantResponsePagedResults, ApplicantStatus } from "@/lib/api/types";

export interface GetApplicantsParams {
  SearchString?: string;
  status?: ApplicantStatus;
  TrackId?: string;
  CurentPage?: number;
  PageSize?: number;
}

export const applicantApi = {
  getApplicants: ({ CurentPage = 1, PageSize = 5, ...params }: GetApplicantsParams = {}) =>
    apiRequest<ApplicantResponsePagedResults>(
      "/api/Applicant",
      { method: "GET" },
      {
        ...params,
        CurentPage,
        PageSize,
      },
    ),
  getApplicantDetails: (id: string, query: { traineeid: string; trainingsessionid: string }) =>
    apiRequest<ApplicantResponseDetailes | null>(`/api/Applicant/${id}`, { method: "GET" }, query),
  updateApplicantStatus: (id: string, status: ApplicantStatus) =>
    apiRequest<void>(`/api/Applicant/${id}`, { method: "PUT" }, { status }),
};
