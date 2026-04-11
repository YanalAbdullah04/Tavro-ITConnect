using ITConnect.Data.RequestsModel.PostDTOs;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using ITConnect.Models.Repository.cs;
using System.Threading.Tasks;

namespace ITConnect.Services
{
    public class PostService : IPostService
    {
        private readonly IPostRepository postRepository;
        private readonly IUserContext userContext;

        public PostService(IPostRepository postRepository, IUserContext userContext)
        {
            this.postRepository = postRepository;
            this.userContext = userContext;
        }

        public async Task<bool> AddPostAsync(AddPostRequest postRequest)
        {
            Post post = new Post()
            {
                Benefits = postRequest.Benefits,
                CompanyId = userContext.CompanyId,
            Deadline = postRequest.Deadline,
                Description = postRequest.Description,
                ReqSkills = postRequest.ReqSkills,
                Responsibility = postRequest.Responsibility,
                Title = postRequest.Title,
                TrainingSessionId = postRequest.TrainingSessionId, 
                Status = postRequest.Status ?? PostStatus.Pending
            };
            return await postRepository.AddAsync(post);
        }

        public async Task<bool> DeletePostAsync(string id)
        {
            var post = await postRepository.GetByIdAsync(id);
            if (post == null)
                return false;
            return await postRepository.DeleteAsync(id, post);

        }

        public async Task<IEnumerable<PostResponse>> GetAllPostsAsync()
        {
            return await postRepository.GetPostResponseAsync();

        }

        public async Task<bool> UpdatePostAsync(UpdatePostRequest updatePostRequest)
        {
            var post = await postRepository.GetByIdAsync(updatePostRequest.Id);
            if (post == null)
                return false;

            post.Description = updatePostRequest.Description;
            post.Title = updatePostRequest.Title;
            post.Status = updatePostRequest.Status ?? post.Status;
            post.Deadline = updatePostRequest.Deadline;
            post.Benefits = updatePostRequest.Benefits;
            post.Responsibility = updatePostRequest.Responsibility;
            post.ReqSkills = updatePostRequest.ReqSkills;
            post.TrainingSessionId = updatePostRequest.TrainingSessionId;

            return await postRepository.UpdateAsync(post.Id, post);
        }
    }
}
