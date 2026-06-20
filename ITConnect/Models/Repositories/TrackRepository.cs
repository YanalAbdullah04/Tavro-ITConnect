using ITConnect.Data;
using ITConnect.Data.RequestsModel;
using ITConnect.Data.ResponseModel;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;

namespace ITConnect.Models.Repositories
{
    public class TrackRepository : GenericRepository<Track>, ITrackRepository
    {

        public TrackRepository(ApplicationDbContext db) : base(db)
        {
            
        }
        
   
        public async Task<TrackResponse> GetTrackResponseAsync(Track track)
        {

            var response= await GetTrackResponseQuery().SingleOrDefaultAsync(x=>x.Id==track.Id);
            if (response == null)
                throw new KeyNotFoundException("track is not found");
            return response;

        }
   

        public async Task<List<TrackResponse>> GetTrackResponseAsync()
        {


            var response = await GetTrackResponseQuery().ToListAsync();
            return response;

        }


        public IQueryable<TrackResponse> GetTrackResponseQuery() {
           var response= Db.Tracks.OrderByDescending(x => x.CreatedAt).Select(x =>
                    new TrackResponse()
                    {
                        Description = x.Description,
                        Name = x.Name,
                        Id = x.Id,
                        NumberOfTrainings = Db.TrainingSessions.Count(ts => ts.TrackId == x.Id),
                        NumberOfTrainees = Db.Trainees.Count(t =>
                        Db.TrainingSessions.Any(ts => ts.Id == t.TrainingSessionId && ts.TrackId == x.Id))
                    }
                );
            return response;
        }

    }//class 
    

}
