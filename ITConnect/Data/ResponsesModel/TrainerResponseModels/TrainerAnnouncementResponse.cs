namespace ITConnect.Data.ResponsesModel.TrainerResponseModels
{
    public class TrainerAnnouncementResponse
    {
        public string AnnouncementId { get; set; }
        public string TrainingSessionId { get; set; }
        public string TrainingSessionName { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
