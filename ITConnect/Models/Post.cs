namespace ITConnect.Models
{
    using System;


    
    public class Post : BaseEntity
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Deadline { get; set; }
        public string ReqSkills { get; set; } 
        public string Responsibility { get; set; }
        public string Benefits { get; set; } 
        public string Status { get; set; }
        public string CompanyId { get; set; }
        public Company Company { get; set; }
        public string TrainingSessionId { get; set; } // unique
        public TrainingSession TrainingSession { get; set; }
    }

}
