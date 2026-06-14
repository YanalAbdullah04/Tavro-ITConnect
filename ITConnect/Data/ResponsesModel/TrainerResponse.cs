using ITConnect.Models;
using Microsoft.AspNetCore.Identity;

namespace ITConnect.Data.ResponsesModel
{



    public class TrainerResponse
    {
        
        public string UserId { get; set; }          
        public string TrainerName { get; set; }
        public string? Specialization { get; set; }
        public string? phone { get; set; }
        public string? Email { get; set; }

        public int TrainingSessionsCount { get; set; }
        public int CountStudents { get; set; }


    }



    public class TrainerOverView {
        public int TotalTrainers { get; set; }
        public int TotalTrainees { get; set; }
    }

    public class TrainingResponsePage() {
        public List<TrainerResponse> TrainersResponseList { get; set; }
        public TrainerOverView TrainerOverView { get; set; }

    }

}
