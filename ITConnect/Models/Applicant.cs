namespace ITConnect.Models
{


    // 12. Applicant
    public class Applicant :BaseEntity
    {
        public Trainee Trainee { get; set; }
        public string TraineeId { get; set; }// composit
        public Company Company { get; set; }
        public string CompanyId { get; set; }
        public TrainingSession TrainingSession { get; set; }

        public string TrainingSessionId { get; set; }//composit
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
