using ITConnect.Data.RequestsModel.TrackDTOs;
using ITConnect.Data.RequestsModel.TrainerResponse;
using ITConnect.Data.ResponsesModel;

namespace ITConnect.Services
{

    public interface ITrainerService
    {
        public Task<PagedResults<TrainerResponse>> GetAllTrainerAsync(string searchstring, int CurentPage, int PageSize);
        public Task<TrainerProfileResponse> GetTrainerProfileResponseAsync(string TrainerId);
        Task<bool> UpdateTrainerProfileAsync(UpdateTrainerRequest updateTrainerRequest);
        public Task<bool> DeleteTrainerAsync(string Trainer);
        }

}
