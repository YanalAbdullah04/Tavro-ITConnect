namespace ITConnect.Models
{

    public class TaskAssignment :BaseEntity
    {
        public ApplicationTask ApplicationTask { get; set; }
        public string ApplicationTaskId { get; set; }
        public string TraineeId { get; set; }
        public Trainee Trainee { get; set; }
        public bool Status  { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }

}
