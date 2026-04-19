using ITConnect.Data.ResponsesModel;
using ITConnect.Iservices;
using ITConnect.Models;
using ITConnect.Models.Repository.cs;

namespace ITConnect.Services
{
    public class ApplicantServie : IApplicantService
    {
        private readonly IApplicantRepository applicantRepository;

        public ApplicantServie(IApplicantRepository applicantRepository)
        {
            this.applicantRepository = applicantRepository;
        }
        public async Task<bool> DeleteApplicantAsync(string id)
        {
            var applicant=await applicantRepository.GetByIdAsync(id);
            if (applicant == null)
                return false;
            return await applicantRepository.DeleteAsync(id, applicant);

        }

        public async Task<PagedResults<ApplicantResponse>> GetAllApplicantAsync(int curentPage, int pageSize, string? searchstring, ApplicantStatus? status, string? trackid)
        {
            var result= await applicantRepository.GetApplicantResponsePageAsync(curentPage,pageSize,searchstring, status,trackid);
       
            return result;
        }

        public async Task<ApplicantResponseDetailes> GetApplicantResponseDetailesAsync( string applicantId,string traineeId, string trainingSessionId)
        {

            return await applicantRepository.GetApplicantResponseDetailesAsync(traineeId,trainingSessionId);
        }

        public async  Task<bool> UpdateApplicantStatusAsync(string applicantId,ApplicantStatus status)
        {
           var applicant= await applicantRepository.GetByIdAsync(applicantId);
            if (applicant == null)
                return false;
            applicant.Status = status;
            return await applicantRepository.UpdateAsync(applicantId, applicant);
        }



    }
}
