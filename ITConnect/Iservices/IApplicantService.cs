using ITConnect.Data.RequestsModel.PostDTOs;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models;
using Microsoft.AspNetCore.Mvc;

namespace ITConnect.Iservices
{
    public interface IApplicantService
    {
        public  Task<PagedResults<ApplicantResponse>> GetAllApplicantAsync(int curentPage, int pageSize, string? searchstring, ApplicantStatus? status, string? trackid);
        public Task<ApplicantResponseDetailes> GetApplicantResponseDetailesAsync(string applicantId, string traineeId,string trainingSessionId);
        public Task<bool> UpdateApplicantStatusAsync(string applicantId, ApplicantStatus status);
        public Task<bool> DeleteApplicantAsync(string id);


    }
}
