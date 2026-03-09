namespace ITConnect.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    namespace TrainingManagement.Models
    {
        // 2. Company
        public class Company
        {
            public int Id { get; set; }
            public string Address { get; set; }
            public string WebsiteLink { get; set; }
            public string Description { get; set; }
            public int UserId { get; set; }
        }

        // 4. Trainer
        public class Trainer
        {
            public int Id { get; set; }
            public string Brief { get; set; }
            public string Specialization { get; set; }
            public string GithubUsername { get; set; }
            public int UserId { get; set; }
            public int CompanyId { get; set; }
        }

        // 5. Github Account
        public class GithubAccount
        {
            public int Id { get; set; }
            public int UserId { get; set; }
            public string GithubUserId { get; set; }
            public string GithubUsername { get; set; }
            public string IsRole { get; set; }
            public string AccessTokenEnc { get; set; }
            public string Scope { get; set; }
            public DateTime ConnectedAt { get; set; }
            public DateTime LastUsedAt { get; set; }
        }

        // 6. Track
        public class Track
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
            public int CompanyId { get; set; }
        }

        // 7. Training Session
        public class TrainingSession
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
            public bool IsPaid { get; set; }
            public string Location { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
            public int SeatsNumber { get; set; }
            public string TrainingStatus { get; set; }
            public int TrackId { get; set; }
            public int CompanyId { get; set; }
            public int TrainerId { get; set; }
        }

        // 8. Task
        public class Task
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string Notes { get; set; }
            public DateTime AssignedAt { get; set; }
            public DateTime Deadline { get; set; }
            public string AttachmentLink { get; set; }
            public int TrainingSessionId { get; set; }
            public int TrainerId { get; set; }
        }

        // 9. Task Assignment
        public class TaskAssignment
        {
            public int Id { get; set; }
            public int TaskId { get; set; }
            public int TraineeId { get; set; }
            public string Status { get; set; }
            public DateTime AssignedAt { get; set; }
        }

        // 10. Task Submission
        public class TaskSubmission
        {
            public int Id { get; set; }
            public int TaskAssignmentId { get; set; }
            public string GithubRepo { get; set; }
            public string GithubBranch { get; set; }
            public string GithubCommitSha { get; set; }
            public string GithubRepoUrl { get; set; }
            public DateTime SubmittedAt { get; set; }
            public int SubmittedBy { get; set; } // trainee_id
            public int SubmittedTo { get; set; } // trainer_id
            public int TrainingSessionId { get; set; }
        }

        // 11. Post
        public class Post
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public DateTime Deadline { get; set; }
            public string ReqSkills { get; set; } // JSON FORMAT
            public string Responsibility { get; set; } // JSON FORMAT
            public string Benefits { get; set; } // JSON FORMAT
            public string Status { get; set; }
            public int CompanyId { get; set; }
            public int TrainingSessionId { get; set; } // unique
        }

        // 12. Applicant
        public class Applicant
        {
            public int Id { get; set; }
            public int TraineeId { get; set; }
            public int CompanyId { get; set; }
            public int TrainingSessionId { get; set; }
            public string Status { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        // 13. Announcement
        public class Announcement
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string Message { get; set; }
            public DateTime CreatedAt { get; set; }
            public bool IsRead { get; set; }
            public int TrainingSessionId { get; set; }
        }

        // 14. Chat Session
        public class ChatSession
        {
            public int Id { get; set; }
            public int TrainerId { get; set; }
            public int TraineeId { get; set; }
            public int TrainingSessionId { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        // 15. Chat Message
        public class ChatMessage
        {
            public int Id { get; set; }
            public int ChatSessionId { get; set; }
            public int SenderId { get; set; }
            public string MessageText { get; set; }
            public string MessageStatus { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        // 16. Evaluate Task
        public class EvaluateTask
        {
            public int Id { get; set; }
            public decimal Grade { get; set; }
            public string Feedback { get; set; }
            public int TaskAssignmentId { get; set; }
        }
    }
}
