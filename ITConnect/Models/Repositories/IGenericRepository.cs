using ITConnect.Models;
namespace ITConnect.Models.Repository.cs
{
    public interface IGenericRepository<T> where T:BaseEntity
    {

        Task<T> GetByIdAsync(string id);
        Task<bool> ExistByIdAsync(string id);
        Task<IEnumerable<T>> GetAllAsync();
        IQueryable<T> GetPage(int page = 1, int pagesize = 10);
        Task<bool> AddAsync(T entity);
        Task<bool> UpdateAsync(string Id,T entity);
        Task<bool> DeleteAsync(string id, T entity);
        Task<int> countAsync();







    }
}
