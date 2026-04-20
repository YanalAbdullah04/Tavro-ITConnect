using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repository.cs; // Assuming IGenericRepository is here

namespace ITConnect.Models.Repositories
{
    public interface ITrainerRepository : IGenericRepository<Trainer>
    {
  
        Task<PagedResults<TrainerResponse>> GetTrainerResponsePageAsync(string? searchstring,int currentpage, int pagesize);

     
        Task<TrainerProfileResponse?> GetTrainerResponseProfileAsync(string trainerid);
    }
}