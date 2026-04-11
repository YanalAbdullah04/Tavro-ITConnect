using ITConnect.Models;
﻿using ITConnect.Models;

namespace ITConnect.Data.ResponsesModel
{
    public class ApplicantResponse
    {
        public string id { get; set; }
        public string TraineeId { get; set; }// composit

        public string TrainingSessionId { get; set; }//composit
        public ApplicantStatus Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
