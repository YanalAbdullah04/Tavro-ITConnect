using ITConnect.Models;
using Microsoft.AspNetCore.Identity;

namespace ITConnect.Data.RequestsModel.TrainerResponse
{
    public class SettingTrainerProfileRequest
    {
        public string TrainerId { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }

        public string Phone { get; set; }

        public string Specialization { get; set; }


        public string? GithubUsername { get; set; }
        public string? ImgUrl { get; set; }


    }
}
