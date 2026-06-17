namespace ITConnect.Data.ResponsesModel.TrainerResponseModels
{
    public class TrainerDashboardOverviewResponse
    {
        public int AssigingStudentsCount { get; set; }//overview statistics
        public int TotalTraningCount { get; set; }//overview statistics
        public int PendingEvaluationsCount { get; set; }//overveiw statistics
        public List<TrainingDtoInTrainerOverview> TrainingDto { get; set; }
    }
    public class TrainingDtoInTrainerOverview
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public int TotalStudents { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int TaskCount { get; set; }
    }

}





