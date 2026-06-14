using ITConnect.Data;
using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TraineeResponseModels;
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
                Responsibility = p.Responsibility,
                Benefits = p.Benefits,
                Status = p.Status,
                Title = p.Title,
                TrainingSessionId = p.TrainingSessionId,

                NumberOfApplicants = Db.Applicants.Where(a => a.TrainingSessionId == p.TrainingSessionId).Count(),              
            }
            );
            return response;
        }

        public async Task<PagedResults<InternshipResponse>> GetInternshipResponsePageAsync(string? searchstring, string? location, string? track, int currentpage, int pagesize)
        {
            var query = Db.Posts.IgnoreQueryFilters().AsQueryable();

            if (!string.IsNullOrEmpty(searchstring))
                query = query.Where(p => p.Title.Contains(searchstring) || p.Company.Name.Contains(searchstring));

            if (!string.IsNullOrEmpty(location))
                query = query.Where(p => p.TrainingSession.Location.Contains(location));

            if (!string.IsNullOrEmpty(track))
                query = query.Where(p => p.TrainingSession.TrackId == track);

            var result = query.Select(p => new InternshipResponse()
            {
                PostId = p.Id,
                Title = p.Title,
                Location = p.TrainingSession.Location,
                StartDate = p.TrainingSession.StartDate,
                EndDate = p.TrainingSession.EndDate,
                CompanyName = p.Company.Name,
                NumberOfApplicant = Db.Applicants.IgnoreQueryFilters().Where(a => a.TrainingSessionId == p.TrainingSessionId).Count()
            });

            return await PaginationExtensions.ToPagedResultAsync(result, currentpage, pagesize);
        }

        public async Task<InternShipDetailesResponse> GetInternshipDetailesAsync(string postId)
        {
            var result = await Db.Posts.IgnoreQueryFilters().Where(p => p.Id == postId).Select(p => new InternShipDetailesResponse()
            {
                Title = p.Title,
                Location = p.TrainingSession.Location,
                CompanyName = p.Company.Name,
                StartDate = p.TrainingSession.StartDate,
                EndDate = p.TrainingSession.EndDate,
                ReqSkills = p.ReqSkills,
                Responsibility = p.Responsibility,
                Benefits = p.Benefits,
                TrainingSessionId = p.TrainingSessionId,
                ApplicatantCount = Db.Applicants.IgnoreQueryFilters().Where(a => a.TrainingSessionId == p.TrainingSessionId).Count()
            }).FirstOrDefaultAsync();

            return result;
        }
    }
}
