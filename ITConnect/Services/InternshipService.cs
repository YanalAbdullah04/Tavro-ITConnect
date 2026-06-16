using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Iservices;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using ITConnect.Models.Repository.cs;
using ITConnect.Services.Iservices;

namespace ITConnect.Services
{
    public class InternshipService : IInternshipService
    {
        private readonly IPostRepository postRepository;
        private readonly IApplicantRepository applicantRepository;
        private readonly IUserContext userContext;

        public InternshipService(IPostRepository postRepository, IApplicantRepository applicantRepository, IUserContext userContext)
        {
            this.postRepository = postRepository;
            this.applicantRepository = applicantRepository;
            this.userContext = userContext;
        }

        public async Task<PagedResults<InternshipResponse>> GetAllInternshipsAsync(string? searchString, string? location, string? trackId, int currentPage, int pageSize)
        {
            var traineeId = userContext.IsTrainee ? userContext.TraineeId : null;
            return await postRepository.GetInternshipResponsePageAsync(searchString, location, trackId, currentPage, pageSize, traineeId);
        }

        public async Task<InternShipDetailesResponse> GetInternshipDetailesAsync(string postId)
        {
            var traineeId = userContext.IsTrainee ? userContext.TraineeId : null;
            return await postRepository.GetInternshipDetailesAsync(postId, traineeId);
        }

        public async Task<bool> ApplyAsync(string postId)
        {
            var traineeId = userContext.TraineeId;
            if (string.IsNullOrEmpty(traineeId)) return false;

            return await applicantRepository.CreateApplicationAsync(postId, traineeId);
        }
    }
}
