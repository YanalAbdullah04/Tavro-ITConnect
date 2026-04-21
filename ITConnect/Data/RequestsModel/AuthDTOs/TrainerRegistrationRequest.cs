using System.ComponentModel.DataAnnotations;

namespace ITConnect.Data.RequestsModel.AuthDTOs
{
    public class TrainerRegistrationRequest
    {

        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string? Specialization { get; set; }

    }
}
