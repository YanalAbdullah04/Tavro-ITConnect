using ITConnect.Data;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;

namespace ITConnect.Models.Repositories
{
    public class PostRepository : GenericRepository<Post>, IPostRepository
    {
        public PostRepository(ApplicationDbContext dbContext) : base(dbContext)
        {

        }
        public async Task<PostResponse> GetPostResponseAsync(Post post)
        {
            return await GetPostResponseeQuery().SingleAsync(x=>x.id==post.Id);
        }

        public async Task<List<PostResponse>> GetPostResponseAsync()
        {
            return await  GetPostResponseeQuery().ToListAsync();
        }

        public IQueryable<PostResponse> GetPostResponseeQuery()
        {

            var response = Db.Posts.Select(p =>
            new PostResponse()
            {
                Deadline = p.Deadline,
                Description = p.Description,
                id = p.Id,
                ReqSkills = p.ReqSkills,
                Status = p.Status,
                Title = p.Title,
                TrainingSessionId = p.TrainingSessionId,

                NumberOfApplicants = Db.Applicants.Where(a => a.TrainingSessionId == p.TrainingSessionId).Count(),              
            }
            );
            return response;
        }
    }
}
