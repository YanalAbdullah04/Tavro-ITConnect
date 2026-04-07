namespace ITConnect.Models
{
    using System;



    public class ApplicationTask :BaseEntity
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Notes { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public DateTime Deadline { get; set; }
        public string? AttachmentUrl { get; set; }
        public string TrainingSessionId { get; set; }
        public TrainingSession TrainingSession { get; set; }
        public string TrainerId { get; set; }
        public Trainer Trainer  { get; set; }
    }

}
