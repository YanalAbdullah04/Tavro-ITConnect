using ITConnect.Models;
using Microsoft.AspNetCore.Identity;

namespace ITConnect.Data.ResponsesModel
{
    public class ApplicantResponseDetailes
    {
        public string TrainingSessionId { get; set; }//composit
        public string TraineeName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string TrackName { get; set; }// get from trainingsessionid
        public string TrainingSessionTitle { get; set; }// get from trainingsessionid
        public DateTime applicationDate { get; set; }// get from trainingsessionid
        public string? Skills { get; set; }
        public ApplicantStatus status { get; set; }// get from trainingsessionid
        public string? ResumeUrl { get; set; }
        public string? PortfolioLink { get; set; }
    }
}
