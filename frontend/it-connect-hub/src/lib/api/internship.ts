import { apiRequest } from "@/lib/api/client";
import type { InternShipDetailesResponse, InternshipResponsePagedResults } from "@/lib/api/types";

export interface GetInternshipsParams {
  searchstring?: string;
  Location?: string;
  Track?: string;
  currentpage?: number;
  pagesize?: number;
}

export const internshipApi = {
  getInternships: ({ currentpage = 1, pagesize = 5, ...params }: GetInternshipsParams = {}) =>
    apiRequest<InternshipResponsePagedResults>("/api/Internship", { method: "GET" }, { ...params, currentpage, pagesize }),
  getInternship: (Postid: string) =>
    apiRequest<InternShipDetailesResponse>(`/api/Internship/${Postid}`, { method: "GET" }),
  apply: (Postid: string) =>
    apiRequest<void>(`/api/Internship/${Postid}/apply`, { method: "POST" }),
};
