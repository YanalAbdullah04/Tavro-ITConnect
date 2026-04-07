namespace ITConnect.Data.RequestsModel.TrainingSessionDtos
{
    public class UpdateTrainingSessionRequest
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsPaid { get; set; }
        public string TrainingStatus { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int SeatsNumber { get; set; }
        public string TrackId { get; set; }
        public string TrainerId { get; set; }
    }
}
