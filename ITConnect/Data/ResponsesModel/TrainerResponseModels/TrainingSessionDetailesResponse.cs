namespace ITConnect.Data.ResponsesModel.TrainerResponseModels
{
    public class TrainingSessionDetailesResponse//inside each trainingsession in trainer dashboard
    {
        public string StudentId { get; set; }
        public string StudentName { get; set; }
        public string Email { get; set; }
        public int numberOfTasks { get; set; }//for each student

    }

}

