using ITConnect.Data.RequestsModel.TrainerResponse;
using ITConnect.Data.RequestsModel.TrainerDto;
using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TrainerResponseModels;
using ITConnect.Iservices;
using ITConnect.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ITConnect.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainerController : ControllerBase
    {
        private readonly ITrainerService TrainerService;

        public TrainerController(ITrainerService trainerService)
        {
            TrainerService = trainerService;
        }
        [Authorize(Roles = "Company")]
        [HttpGet]
        public async Task<ActionResult<PagedResults<TrainerResponse>>> getall([FromQuery] string? SearchString,
            [FromQuery] int CurentPage = 1,
            [FromQuery] int PageSize = 5
            )
        {

            var reult = await TrainerService.GetAllTrainerAsync(SearchString, CurentPage, PageSize);
            return Ok(reult);

        }

        [Authorize(Roles = "Company,Trainer")]
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<TrainerProfileResponse>> getTrainerProfile(Guid id)
        {
            var reult = await TrainerService.GetTrainerProfileResponseAsync(id.ToString());
            if (reult == null)
                return NotFound();
            return Ok(reult);

        }

        [Authorize(Roles = "Company,Trainer")]
        [HttpPut("Management")]
        public async Task<IActionResult> UpdateTrainerProfile(SettingTrainerProfileRequest updateTrainerRequest)
        {
            var reult = await TrainerService.SettingTrainerProfileAsync(updateTrainerRequest);
            return NoContent();

        }

        [Authorize(Roles = "Company")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> deletetrainer(Guid id)
        {
            var reult = await TrainerService.DeleteTrainerAsync(id.ToString());
            return NoContent();

        }
        [Authorize(Roles = "Trainer")]
        [HttpGet("Dashboard")]
        public async Task<ActionResult<TrainerDashboardOverviewResponse>> GetDashboard()
        {
            var result = await TrainerService.GetTrainerDashboardAsync();
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [Authorize(Roles = "Trainer")]
        [HttpGet("Sessions")]
        public async Task<ActionResult<PagedResults<TrainingDtoInTrainerOverview>>> GetSessions(
            [FromQuery] string? SearchString,
            [FromQuery] int CurentPage = 1,
            [FromQuery] int PageSize = 6)
        {
            var result = await TrainerService.GetTrainerSessionsAsync(SearchString, CurentPage, PageSize);
            return Ok(result);
        }

        [Authorize(Roles = "Trainer")]
        [HttpGet("Trainees")]
        public async Task<ActionResult<PagedResults<StudentWithinTraining>>> GetTrainees(
            [FromQuery] string? SearchString,
            [FromQuery] string? TrainingSessionId,
            [FromQuery] int CurentPage = 1,
            [FromQuery] int PageSize = 8)
        {
            var result = await TrainerService.GetTrainerTraineesAsync(SearchString, TrainingSessionId, CurentPage, PageSize);
            return Ok(result);
        }

        [Authorize(Roles = "Trainer")]
        [HttpGet("Evaluations")]
        public async Task<ActionResult<PagedResults<TrainerTaskSubmissionsDto>>> GetEvaluations(
            [FromQuery] string? SearchString,
            [FromQuery] string? Status,
            [FromQuery] string? TrainingSessionId,
            [FromQuery] string? TraineeId,
            [FromQuery] int CurentPage = 1,
            [FromQuery] int PageSize = 8)
        {
            var result = await TrainerService.GetTaskDeliverablesAsync(SearchString, Status, TrainingSessionId, TraineeId, CurentPage, PageSize);
            return Ok(result);
        }

        [Authorize(Roles = "Trainer")]
        [HttpGet("Evaluations/Meta")]
        public async Task<ActionResult<TaskEvaluationsResponse>> GetEvaluationsMeta()
        {
            var result = await TrainerService.GetTaskEvaluationsMetaAsync();
            return Ok(result);
        }

        [Authorize(Roles = "Trainer")]
        [HttpGet("Announcements")]
        public async Task<ActionResult<PagedResults<TrainerAnnouncementResponse>>> GetAnnouncements(
            [FromQuery] string? SearchString,
            [FromQuery] string? TrainingSessionId,
            [FromQuery] int CurentPage = 1,
            [FromQuery] int PageSize = 5)
        {
            var result = await TrainerService.GetAnnouncementsAsync(SearchString, TrainingSessionId, CurentPage, PageSize);
            return Ok(result);
        }

        [Authorize(Roles = "Trainer")]
        [HttpPost("Announcements")]
        public async Task<IActionResult> CreateAnnouncement([FromBody] AnnouncementRequest request)
        {
            var result = await TrainerService.CreateAnnouncementAsync(request);
            if (!result)
                return BadRequest(new { message = "Failed to send announcement. Check the session and message details." });

            return NoContent();
        }

        [Authorize(Roles = "Trainer")]
        [HttpGet("TrainingSession/{id:guid}")]
        public async Task<ActionResult<TrainingSessionDetailesResponse>> GetTrainingSessionDetails(Guid id)
        {
            var result = await TrainerService.GetTrainingSessionDetailesResponseAsync(id.ToString());
            if (result == null)
                return NotFound();
            return Ok(result);
        }


    }
}
