namespace ITConnect.Data.ResponsesModel.TrainerResponseModels
{
    public class TaskEvaluationsResponse
    {
        public List<traineeDtoInEvaluationResponse> Trainees { get; set; }
        public List<TrainingDtInEvaluationResponseo> Trainings { get; set; }
        
            public int PendingEvaluations { get; set; }
            public int Evaluated { get; set; }
    }
    public class traineeDtoInEvaluationResponse {
        public  string TraineeId { get; set; }
        public string TraineeName { get; set; }
      
    }
    public class TrainingDtInEvaluationResponseo
    {
        public  string TrainingSessionId { get; set; }
        public string TrainingSessionName { get; set; }

      
    }
 

}
