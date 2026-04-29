using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TraineeResponseModels;

namespace ITConnect.Iservices
{
    public interface IInternshipService
    {
        Task<PagedResults<InternshipResponse>> GetAllInternshipsAsync(string? searchString, string? location, string? trackId, int currentPage, int pageSize);
        Task<InternShipDetailesResponse> GetInternshipDetailesAsync(string postId);
        Task<bool> ApplyAsync(string postId);
    }
}
