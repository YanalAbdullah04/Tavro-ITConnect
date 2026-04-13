using ITConnect.Data.RequestsModel.PostDTOs;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models;

namespace ITConnect.Services.Iservices
{
    public interface IPostService
    {
        public Task<IEnumerable<PostResponse>> GetAllPostsAsync();
        public Task<bool> AddPostAsync(AddPostRequest postRequest);
        public Task<bool> UpdatePostAsync(UpdatePostRequest postRequest);
        public Task<bool> DeletePostAsync(string id);




    }
}
