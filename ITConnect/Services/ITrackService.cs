using ITConnect.Data.RequestsModel.TrackDTOs;
using ITConnect.Data.ResponseModel;
using ITConnect.Models;

namespace ITConnect.Services
{
    public interface ITrackService
    {
   
        Task<List<TrackResponse>> GetAllTracksAsync();
        Task<bool> AddTrackAsync(AddTrackRequest addTrackRequest);
        Task<bool> UpdateTrackAsync(UpdateTrackRequest updateTrackRequest);
        Task<bool> DeleteTrackAsync(string id);

    }
}
