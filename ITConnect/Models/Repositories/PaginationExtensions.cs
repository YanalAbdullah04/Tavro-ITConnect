using ITConnect.Data.ResponsesModel;
using Microsoft.EntityFrameworkCore;

namespace ITConnect.Models.Repositories
{
    public static class PaginationExtensions
    {
        public static async Task<PagedResults<T>> ToPagedResultAsync<T>(
            this IQueryable<T> query,
            int page,
            int pageSize) where T : class
        {
         
            var currentPage = page < 1 ? 1 : page;
            var size = pageSize < 1 ? 10 : pageSize;

   
            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((currentPage - 1) * size)
                .Take(size)
                .ToListAsync();

            return PagedResults<T>.Create(items, totalCount, currentPage, size);
        }
    }
}
