namespace ITConnect.Data.ResponsesModel.DataResponsesModel
{
    public class BranchPerformanceResponse
    {
        public string TrackId { get; set; }
        public string TrackName { get; set; }
        public int NumberOfStudents { get; set; }
        public int NumberOfTrainings { get; set; }
        public int CompletionRate { get; set; }
        public string Health { get; set; }
    }
}
