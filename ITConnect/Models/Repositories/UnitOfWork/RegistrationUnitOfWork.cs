using ITConnect.Data;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore.Storage;

namespace ITConnect.Models.Repositories.UnitOfWork
{
    public class RegistrationUnitOfWork : IRegisterationUnitOfWork
    {
    
      
        public ApplicationDbContext DB { get; }
        public IGenericRepository<Company> CompanyRepository { get { return new GenericRepository<Company>(DB); } set => throw new NotImplementedException(); }

        public IGenericRepository<Trainee> TraineeRepository { get { return new GenericRepository<Trainee>(DB); } set => throw new NotImplementedException(); }

        public RegistrationUnitOfWork(ApplicationDbContext DB)
        {
            this.DB = DB;

        }
 

        public async  Task<IDbContextTransaction> BeginTransactionAsync()=>await DB.Database.BeginTransactionAsync();
    
        public async Task CommitTransactionAsync()=>await DB.Database.CommitTransactionAsync();
 

        public async Task<int> CompleteAsync()=>await DB.SaveChangesAsync();

        

        public void Dispose()=>DB.Dispose();
    

        public async Task RollbackTransactionAsync()
        {
             await DB.Database.RollbackTransactionAsync();
        }
    }
}
