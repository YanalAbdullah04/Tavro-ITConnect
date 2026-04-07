using ITConnect.Data.RequestsModel.TrackDTOs;
using ITConnect.Data.ResponseModel;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using ITConnect.Models.Repository.cs;
using Microsoft.AspNetCore.Components.Sections;
using Microsoft.EntityFrameworkCore.Internal;

namespace ITConnect.Services
{
    public class TrackServices : ITrackService
    {
        private readonly IUserContext userContext;

        public ITrackRepository TrackRepository { get; }
        public IGenericRepository<TrainingSession> TrainingSessionRepository { get; }
        public TrackServices(ITrackRepository trackrepository, IUserContext userContext)
        {
            TrackRepository = trackrepository;
            this.userContext = userContext;
        }



        public async Task<List<TrackResponse>> GetAllTracksAsync()
        {

            return await TrackRepository.GetTrackResponseAsync();

        }

        public async Task<bool> AddTrackAsync(AddTrackRequest addTrackRequest)
        {

            Track track = new Track()
            {
                CompanyId = userContext.CompanyId!,
                Description = addTrackRequest.Description,
                Name = addTrackRequest.Name,


            };
            return await TrackRepository.AddAsync(track);




        }

        public async Task<bool> UpdateTrackAsync(UpdateTrackRequest updateTrackRequest)
        {
            Track track = await TrackRepository.GetByIdAsync(updateTrackRequest.Id);

            if (track==null)
                throw new NullReferenceException("null ref");

            track.Description = updateTrackRequest.Description;
            track.Name = updateTrackRequest.Name;


            return await TrackRepository.UpdateAsync(track.Id, track);

        }

        public async Task<bool> DeleteTrackAsync(string id)
        {
            if (!await TrackRepository.ExistByIdAsync(id))
                return false;
            return await TrackRepository.DeleteAsync(id, null);




        }








    }
}
