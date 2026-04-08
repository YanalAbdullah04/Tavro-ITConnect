using Microsoft.EntityFrameworkCore.Storage;

namespace ITConnect.Models.Repositories.UnitOfWork
{
    public interface IUnitOfWork :IDisposable
    {
      
            Task<int> CompleteAsync();

            Task <IDbContextTransaction> BeginTransactionAsync();
            Task CommitTransactionAsync();
            Task RollbackTransactionAsync();

        


    }
}
