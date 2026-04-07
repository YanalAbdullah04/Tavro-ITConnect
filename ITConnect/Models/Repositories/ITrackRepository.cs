using ITConnect.Data.RequestsModel;
using ITConnect.Data.ResponseModel;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;

namespace ITConnect.Models.Repositories
{
    public interface ITrackRepository:IGenericRepository<Track>
    {

        Task<TrackResponse> GetTrackResponseAsync(Track track);
        Task<List<TrackResponse>> GetTrackResponseAsync();
        IQueryable<TrackResponse> GetTrackResponseQuery();
        //Task<bool> AddTrackAsync(Track track);
        




        




    }
}
