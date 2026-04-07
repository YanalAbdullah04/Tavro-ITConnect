using ITConnect.Models.Repository.cs;

namespace ITConnect.Models.Repositories.UnitOfWork
{
    public interface IRegisterationUnitOfWork:IUnitOfWork
    {
        public IGenericRepository<Company> CompanyRepository { get; set; }
        public IGenericRepository<Trainee> TraineeRepository { get; set; }

    }
}
