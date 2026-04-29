namespace ITConnect.Data.ResponsesModel.TraineeResponseModels
{
    public class InternshipResponse
    {
        public string PostId { get; set; }
        public string Title { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string CompanyName { get; set; }
        public int NumberOfApplicant { get; set; }
    }
}
