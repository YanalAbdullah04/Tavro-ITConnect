import { apiRequest } from "@/lib/api/client";
import type { AddPostRequest, PostResponse, UpdatePostRequest } from "@/lib/api/types";

export const postApi = {
  getPosts: () => apiRequest<PostResponse[]>("/api/Post", { method: "GET" }),
  createPost: (body: AddPostRequest) =>
    apiRequest<void>("/api/Post", { method: "POST", body }),
  updatePost: (body: UpdatePostRequest) =>
    apiRequest<void>("/api/Post", { method: "PUT", body }),
  deletePost: (id: string) =>
    apiRequest<void>(`/api/Post/${id}`, { method: "DELETE" }),
};
