namespace ITConnect.Models
{
    using System;
    using System.Text.Json;
    using System.Text.Json.Serialization;

    [JsonConverter(typeof(PostStatusJsonConverter))]
    public readonly struct PostStatus
    {
        public string Value { get; }
        private PostStatus(string value) { Value = value; }

        public static PostStatus Pending => new PostStatus("Pending");
        public static PostStatus Published => new PostStatus("Published");
        public static PostStatus Unpublished => new PostStatus("Unpublished");

        public override string ToString() => Value;

        public static bool operator ==(PostStatus left, PostStatus right) => left.Value == right.Value;
        public static bool operator !=(PostStatus left, PostStatus right) => left.Value != right.Value;
        public override bool Equals(object obj) => obj is PostStatus other && Value == other.Value;
        public override int GetHashCode() => Value?.GetHashCode() ?? 0;

        public static PostStatus FromString(string value) => value?.ToLower() switch
        {
            "pending" => Pending,
            "published" => Published,
            "unpublished" => Unpublished,
            _ => throw new ArgumentException($"Invalid status: {value}")
        };

        public static PostStatus FromInt(int value) => value switch
        {
            0 => Pending,
            1 => Published,
            2 => Unpublished,
            _ => throw new ArgumentException($"Invalid status code: {value}")
        };
    }

    public class PostStatusJsonConverter : JsonConverter<PostStatus>
    {
        public override PostStatus Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Number)
            {
                return PostStatus.FromInt(reader.GetInt32());
            }
            return PostStatus.FromString(reader.GetString());
        }
        public override void Write(Utf8JsonWriter writer, PostStatus value, JsonSerializerOptions options) => writer.WriteStringValue(value.Value);
    }


    
    public class Post : BaseEntity
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Deadline { get; set; }
        public string ReqSkills { get; set; } 
        public string Responsibility { get; set; }
        public string Benefits { get; set; } 
        public PostStatus Status { get; set; } = PostStatus.Pending;
        public string CompanyId { get; set; }
        public Company Company { get; set; }
        public string TrainingSessionId { get; set; } // unique
        public TrainingSession TrainingSession { get; set; }
        
    }

}
