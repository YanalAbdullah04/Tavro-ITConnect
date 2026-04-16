namespace ITConnect.Data.ResponsesModel.DataResponsesModel
{
    public class ActiveTrainingProgressResponse
    {
        public string TrainingSessionId { get; set; }
        public string TrainingName { get; set; }
        public string Status { get; set; }
        public string Location { get; set; }
        public int SeatsNumber { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int ProgressPercentage { get; set; }
    }
}
