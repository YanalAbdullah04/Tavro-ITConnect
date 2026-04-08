namespace ITConnect.Models
{

    public class Track :BaseEntity
    {
        //public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string CompanyId { get; set; }
        public Company Company { get; set; }
    }

}
