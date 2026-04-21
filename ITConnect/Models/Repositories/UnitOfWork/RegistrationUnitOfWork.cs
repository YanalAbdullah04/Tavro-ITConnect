using ITConnect.Data;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore.Storage;

namespace ITConnect.Models.Repositories.UnitOfWork
{
    public class RegistrationUnitOfWork : IRegisterationUnitOfWork
    {


        public ApplicationDbContext DB { get; }
     
        private readonly Lazy<IGenericRepository<Company>> _companyRepository;
        private readonly Lazy<IGenericRepository<Trainee>> _traineeRepository;
        private readonly Lazy<IGenericRepository<Trainer>> _trainerRepository;

        public IGenericRepository<Company> CompanyRepository =>_companyRepository.Value;
       

        public IGenericRepository<Trainee> TraineeRepository => _traineeRepository.Value;
        public IGenericRepository<Trainer> TrainerRepository => _trainerRepository.Value;

 

        public RegistrationUnitOfWork(ApplicationDbContext DB)
        {
            this.DB = DB;
            _companyRepository = new Lazy<IGenericRepository<Company>>(() => new GenericRepository<Company>(DB));
            _traineeRepository = new Lazy<IGenericRepository<Trainee>>(() => new GenericRepository<Trainee>(DB));
            _trainerRepository = new Lazy<IGenericRepository<Trainer>>(() => new GenericRepository<Trainer>(DB));
        }


        public async Task<IDbContextTransaction> BeginTransactionAsync() => await DB.Database.BeginTransactionAsync();

        public async Task CommitTransactionAsync() => await DB.Database.CommitTransactionAsync();


        public async Task<int> CompleteAsync() => await DB.SaveChangesAsync();



        public void Dispose() => DB.Dispose();


        public async Task RollbackTransactionAsync()
        {
            await DB.Database.RollbackTransactionAsync();
        }
    }
}
