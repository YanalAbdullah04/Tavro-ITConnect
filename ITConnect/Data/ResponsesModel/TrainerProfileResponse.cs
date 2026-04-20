namespace ITConnect.Data.ResponsesModel
{
    public class TrainerProfileResponse
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Specialty { get; set; } 
        public string Email { get; set; }
        public string Phone { get; set; }

        public int TotalStudentsCount { get; set; }
        public int TotalTrainingsCount { get; set; }
        public int TotalTasksCount { get; set; }

        public IEnumerable<TrainingSummaryDto> TrainingsList { get; set; } 
        public IEnumerable<TraineeUnderTrainerDto> StudentsList { get; set; } 

    }
}

public class TrainingSummaryDto
{
    public string Title { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Location { get; set; }
    public int StudentCount { get; set; }
}
public class TraineeUnderTrainerDto
{
    public string StudentName { get; set; }
    public string TrainingTitle { get; set; }

}
