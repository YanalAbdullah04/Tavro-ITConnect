namespace ITConnect.Models
{

    public class EvaluateTask :BaseEntity
    {
        public bool? passed { get; set; } = false;
        public string? Feedback { get; set; }
        public string TaskAssignmentId { get; set; }
        public TaskAssignment TaskAssignment { get; set; }

    }

}
