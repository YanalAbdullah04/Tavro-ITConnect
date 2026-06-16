namespace ITConnect.Data.ResponsesModel
{
    public class CompanyResponse
    {
        public string CompanyId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public int NumberOfTracks { get; set; }
    }

    public class CompanyTrackResponse
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string CompanyId { get; set; }
    }
}
