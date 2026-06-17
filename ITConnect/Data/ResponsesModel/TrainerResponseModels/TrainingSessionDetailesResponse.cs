namespace ITConnect.Data.ResponsesModel.TrainerResponseModels
{
    
    public class TrainingSessionDetailesResponse//inside each trainingsession in trainer dashboard
    {   public string TrainingSessionName { get; set; }
         public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<StudentWithinTraining> StudentsWithinTraining { get; set; }
        public int NumberOfStudents { get; set; }
        public int TaskCount { get; set; }
    }
    public class StudentWithinTraining
    {
        public string StudentId { get; set; }
        public string StudentName { get; set; }
        public string? Email { get; set; }
        public string? TrainingId { get; set; }
        public string? TrainingTitle { get; set; }
        public int NumberOfTasks { get; set; }//for each student

    }
}
