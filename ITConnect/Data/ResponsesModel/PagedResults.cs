namespace ITConnect.Data.ResponsesModel
{
    public class PagedResults<T> where T : class
    {
        public IEnumerable<T>? Items { get; set; }
        public int TotalCount { get; set; }
        public int CurentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (Double)PageSize);
        public bool HavePreviousPage
        {
            get
            {
                return CurentPage > 1;
            }
            set
            {
            }
        }
        public bool HaveNextPage
        {
            get
            {
                return CurentPage < TotalPages;
            }
            set { }
        }

        private PagedResults()
        {

        }
        public static PagedResults<T> Create(List<T> item,int totlCount,
            int currentpage,
            int pagesize)
        {

            return new PagedResults<T>
            {
                TotalCount = totlCount,
                Items =item,
                
                CurentPage = currentpage,
                PageSize = pagesize
            };


        }


    }
}
