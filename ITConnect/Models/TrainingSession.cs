using System.Text.Json.Serialization;

namespace ITConnect.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TrainingStatus
    {
        Pending,
        Active,
        Complete
    }

    public class TrainingSession :BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsPaid { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int SeatsNumber { get; set; }
        public TrainingStatus TrainingStatus { get; set; }

        //relations
        public string TrackId { get; set; }
        public Track Track { get; set; }


        public string CompanyId { get; set; }
        public Company Company { get; set; }


        public string TrainerId { get; set; }
        public Trainer Trainer { get; set; }

    }
}
