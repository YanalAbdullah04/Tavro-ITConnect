using ITConnect.Data.ResponseModel;
using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Models.Repository.cs;

namespace ITConnect.Models.Repositories
{
    public interface IPostRepository : IGenericRepository<Post>
    {
        Task<PostResponse> GetPostResponseAsync(Post post);
        Task<List<PostResponse>> GetPostResponseAsync();
        IQueryable<PostResponse> GetPostResponseeQuery();
        Task<PagedResults<InternshipResponse>> GetInternshipResponsePageAsync(string? searchstring, string? location, string? track, int currentpage, int pagesize);
        Task<InternShipDetailesResponse> GetInternshipDetailesAsync(string postId);










    }

}
