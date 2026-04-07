using ITConnect.Models;

namespace ITConnect.Data.ResponseModel
{
    public class TrackResponse
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int NumberOfTrainings { get; set; }
        public int NumberOfTrainees{ get; set; }


    }

}
