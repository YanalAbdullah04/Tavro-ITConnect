import { apiRequest } from "@/lib/api/client";
import type {
  LoginAuthResponse,
  LoginDto,
  RegisterationRequest,
  TraineeRegistrationRequest,
  RegistrationAuthResponse,
  TrainerProfileSettingRequest,
  TrainerRegistrationRequest,
} from "@/lib/api/types";

export const accountApi = {
  registerCompany: (body: RegisterationRequest) =>
    apiRequest<RegistrationAuthResponse>("/api/Account/Register/Company", { method: "POST", body, authenticated: false }),
  registerTrainee: (body: TraineeRegistrationRequest) =>
    apiRequest<RegistrationAuthResponse>("/api/Account/Register/Trainee", { method: "POST", body, authenticated: false }),
  registerTrainer: (body: TrainerRegistrationRequest) =>
    apiRequest<RegistrationAuthResponse>("/api/Account/Register/Trainer", { method: "POST", body }),
  inviteMentor: (body: TrainerRegistrationRequest) =>
    apiRequest<RegistrationAuthResponse>("/api/Account/Register/Trainer", { method: "POST", body }),
  setTrainerProfile: (body: TrainerProfileSettingRequest) =>
    apiRequest<RegistrationAuthResponse>("/api/Account/Trainer/profile-setting", { method: "POST", body }),
  login: (body: LoginDto) =>
    apiRequest<LoginAuthResponse>("/api/Account/Login", { method: "POST", body, authenticated: false }),
  testingEmailSender: () =>
    apiRequest<LoginAuthResponse>("/api/Account/testingEmailSender", { method: "POST" }),
};
