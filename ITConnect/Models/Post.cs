namespace ITConnect.Models
{
    using System;


        // 11. Post
        public class Post :BaseEntity
        {
            public string Title { get; set; }
            public string Description { get; set; }



            public DateTime Deadline { get; set; }
            public string ReqSkills { get; set; } // JSON FORMAT
            public string Responsibility { get; set; } // JSON FORMAT
            public string Benefits { get; set; } // JSON FORMAT
            public string Status { get; set; }
            public string CompanyId { get; set; }
        public Company Company { get; set; }
        public string TrainingSessionId { get; set; } // unique
            public TrainingSession TrainingSession { get; set; }
    }
    
}
