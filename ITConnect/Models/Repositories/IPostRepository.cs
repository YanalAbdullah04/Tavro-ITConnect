using ITConnect.Data.ResponseModel;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repository.cs;

namespace ITConnect.Models.Repositories
{
    public interface IPostRepository : IGenericRepository<Post>
    {
        Task<PostResponse> GetPostResponseAsync(Post post);
        Task<List<PostResponse>> GetPostResponseAsync();
        IQueryable<PostResponse> GetPostResponseeQuery();











    }

}
