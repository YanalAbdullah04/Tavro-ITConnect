
using ITConnect.Data;
using ITConnect.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace ITConnect.Models.Repository.cs
{

    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        protected readonly ApplicationDbContext Db;

        protected readonly DbSet<T> dbset;

        public GenericRepository(ApplicationDbContext db)
        {
            Db = db;
            dbset = Db.Set<T>();

        }
        public async Task<bool> ExistByIdAsync(string id)
        {
            return await dbset.AnyAsync(x=>x.Id.ToString().Equals(id));
        }

        public async Task<T> GetByIdAsync(string id)
        {
            return await dbset.SingleOrDefaultAsync(x=>x.Id==id);

        }

        public async Task<T> GetByIdIgnoreFiltersAsync(string id)
        {
            return await dbset.IgnoreQueryFilters().SingleOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await dbset.ToListAsync();
        }

        public async Task<bool> AddAsync(T entity)
        {
            dbset.Add(entity);
            return await Db.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateAsync(string id, T entity)
        {
            if (entity == null && String.IsNullOrEmpty(id))
                throw new NullReferenceException("failed to update , cant find the object ");

            dbset.Update(entity);
            return await Db.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateIgnoreFiltersAsync(string id, T entity)
        {
            if (entity == null && String.IsNullOrEmpty(id))
                throw new NullReferenceException("failed to update , cant find the object ");

            // Since we're updating, EF context handles tracking.
            // But we ignore query filters during retrieval, and save is fine.
            dbset.Update(entity);
            return await Db.SaveChangesAsync() > 0;
        }
        public async Task<bool> DeleteAsync(string id, T entity)
        {
            if (entity == null && String.IsNullOrEmpty(id))
                return false;

                if (entity==null &&!String.IsNullOrEmpty(id))
                entity = await dbset.FindAsync(id);

            dbset.Remove(entity!);

                return await Db.SaveChangesAsync() > 0;

        }
        public async Task<int> countAsync()
        {
            return await dbset.CountAsync();
        }


    }
}
