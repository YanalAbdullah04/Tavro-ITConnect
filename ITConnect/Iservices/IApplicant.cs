using ITConnect.Data.RequestsModel.PostDTOs;
using ITConnect.Data.ResponsesModel;

namespace ITConnect.Iservices
{
    public interface IApplicantService
    {
        public Task<IEnumerable<PostResponse>> GetAllPostsAsync();
        public Task<bool> AddPostAsync(AddPostRequest postRequest);
        public Task<bool> UpdatePostAsync(UpdatePostRequest postRequest);
        public Task<bool> DeletePostAsync(string id);


    }
}
