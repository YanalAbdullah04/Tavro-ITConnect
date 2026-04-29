using ITConnect.Models;

namespace ITConnect.Data.ResponsesModel.TraineeResponseModels
{
    public class InternShipDetailesResponse
    {
        public string Title { get; set; }
        public string Location { get; set; }
        public string CompanyName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ReqSkills { get; set; }
        public string Responsibility { get; set; }
        public string Benefits { get; set; }
        public string TrainingSessionId { get; set; } // unique
        public int ApplicatantCount { get; set; }
    }
}
