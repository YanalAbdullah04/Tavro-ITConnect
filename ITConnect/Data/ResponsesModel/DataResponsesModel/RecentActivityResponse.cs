namespace ITConnect.Data.ResponsesModel.DataResponsesModel
{
    public class RecentActivityResponse
    {
        public string Type { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Status { get; set; }
    }
}
