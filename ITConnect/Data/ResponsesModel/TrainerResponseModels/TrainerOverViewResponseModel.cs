namespace ITConnect.Data.ResponsesModel.TrainerResponseModels
{
    public class TrainerOverViewResponseModel
    {
        public int AssigingStudentsCount { get; set; }//overview statistics


        public int TotalTraningCount { get; set; }//overview statistics


        public int PendingEvaluationsCount { get; set; }//overveiw statistics


        public List<TrainingDtoInTrainerOverview> TrainingDto { get; set; }



    }
    public class TrainingDtoInTrainerOverview
    {

        public long Id { get; set; }

        public string Name { get; set; }

        public long TotalStrudents { get; set; }
    }

}






