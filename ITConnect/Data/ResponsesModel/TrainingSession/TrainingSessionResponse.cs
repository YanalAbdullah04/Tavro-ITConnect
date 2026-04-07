using ITConnect.Models;

namespace ITConnect.Data.ResponsesModel.TrainingSession
{
    public class TrainingSessionResponse
    {
        public string Id { get; set; }
        public string TrainingSessionName { get; set; }
        public string Description { get; set; }
        //public bool IsPaid { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int SeatsNumber { get; set; }
        public string TrainingStatus { get; set; }
        public string TrackId { get; set; }
        public string TrackName { get; set; }
        public string TrainerId { get; set; }
        public string TrainerName { get; set; }


    }
}


