
using ITConnect.Data;
using ITConnect.Data.ResponseModel;
using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;

namespace ITConnect.Models.Repositories
{
    public class TraineeRepository : GenericRepository<Trainee>, ITraineeRepository
    {
        public TraineeRepository(ApplicationDbContext dbContext) : base(dbContext) { }


        public async Task<TraineeProfileRequestAndResponse> GetTraineeResponseAsync(string TraineeId)
        {

            var response = await GetTraineeProfileResponseQuery(TraineeId).SingleOrDefaultAsync();
            if (response == null)
                throw new KeyNotFoundException("Trainee is not found");
            return response;

        }





        public IQueryable<TraineeProfileRequestAndResponse> GetTraineeProfileResponseQuery(string id)
        {
            var response = Db.Trainees.Where(x=>x.Id.Equals(id)).Select(x =>
                     new TraineeProfileRequestAndResponse()
                     {
                         ImageUrl = x.ImageUrl,
                         Name = x.Name,
                         Phone = x.User.PhoneNumber,
                         PortfolioLink = x.PortfolioLink,
                         ResumeUrl = x.ResumeUrl,
                         Skills = x.Skills,


                     }
                 );
            return response;
        }

    }//class 


}

