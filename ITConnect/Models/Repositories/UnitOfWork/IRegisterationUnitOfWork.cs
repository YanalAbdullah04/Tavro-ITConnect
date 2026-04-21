using ITConnect.Models.Repository.cs;

namespace ITConnect.Models.Repositories.UnitOfWork
{
    public interface IRegisterationUnitOfWork:IUnitOfWork
    {
        
        public IGenericRepository<Company> CompanyRepository { get; }

        public IGenericRepository<Trainee> TraineeRepository { get;  }
        public IGenericRepository<Trainer> TrainerRepository { get; }

    }
}
