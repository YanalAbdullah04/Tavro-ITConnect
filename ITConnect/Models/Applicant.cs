namespace ITConnect.Models
{
    using System;
    using System.Text.Json;
    using System.Text.Json.Serialization;

    [JsonConverter(typeof(ApplicantStatusJsonConverter))]
    public readonly struct ApplicantStatus
    {
        public string Value { get; }
        private ApplicantStatus(string value) { Value = value; }

        public static ApplicantStatus Pending => new ApplicantStatus("Pending");
        public static ApplicantStatus Interviewed => new ApplicantStatus("Interviewed");
        public static ApplicantStatus Accepted => new ApplicantStatus("Accepted");
        public static ApplicantStatus Rejected => new ApplicantStatus("Rejected");

        public override string ToString() => Value;

        public static ApplicantStatus FromString(string value) => value?.ToLower() switch
        {
            "pending" => Pending,
            "interviewed" => Interviewed,
            "accepted" => Accepted,
            "rejected" => Rejected,
            _ => throw new ArgumentException($"Invalid applicant status: {value}")
        };

        public static ApplicantStatus FromInt(int value) => value switch
        {
            0 => Pending,
            1 => Interviewed,
            2 => Accepted,
            3 => Rejected,
            _ => throw new ArgumentException($"Invalid applicant status code: {value}")
        };
    }

    public class ApplicantStatusJsonConverter : JsonConverter<ApplicantStatus>
    {
        public override ApplicantStatus Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Number)
                return ApplicantStatus.FromInt(reader.GetInt32());
            return ApplicantStatus.FromString(reader.GetString());
        }
        public override void Write(Utf8JsonWriter writer, ApplicantStatus value, JsonSerializerOptions options) => writer.WriteStringValue(value.Value);
    }

    // 12. Applicant
    public class Applicant :BaseEntity
    {
        public Trainee Trainee { get; set; }
        public string TraineeId { get; set; }// composit
        public Company Company { get; set; }
        public string CompanyId { get; set; }
        public TrainingSession TrainingSession { get; set; }

        public string TrainingSessionId { get; set; }//composit
        public ApplicantStatus Status { get; set; } = ApplicantStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
