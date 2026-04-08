using Microsoft.AspNetCore.Identity;

namespace ITConnect.Data.RequestsModel.AuthDTOs
{
    public class RegisterationRequest
    {

        public string Name { get; set; }
        public string Email { get; set; }
      
        public string Phone { get; set; }
        public string Password { get; set; }


   
    }
}




