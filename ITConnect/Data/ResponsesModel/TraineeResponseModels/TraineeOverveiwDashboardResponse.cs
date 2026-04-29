using ITConnect.Models;

namespace ITConnect.Data.ResponsesModel.TraineeResponseModels
{
    public class TraineeOverveiwDashboardResponse
    {
        List<TraineeTaskAssigenmentDto> traineeTaskAssigenmentDtos;
        List<TraineeAnnouncementDto> traineeAnnouncementDtos;
    }
    public class TraineeTaskAssigenmentDto {
        public string TaskAssignmentId { get; set; }
        public string Status { get; set; }
        public DateTime AssigedAtDate { get; set; }

    }
    public class TraineeAnnouncementDto {
        public string AnnouncementId { get; set; }
        public string Title { get; set; }
    }

}
