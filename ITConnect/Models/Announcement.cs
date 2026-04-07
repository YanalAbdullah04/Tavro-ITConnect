namespace ITConnect.Models
{

    // 13. Announcement
    public class Announcement:BaseEntity
    {
        public string Title { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; }
        public TrainingSession TrainingSession { get; set; }
        public string TrainingSessionId { get; set; }
    }

}
