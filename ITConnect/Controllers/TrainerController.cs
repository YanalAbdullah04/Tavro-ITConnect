using ITConnect.Data.RequestsModel.TrainerResponse;
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

        [Authorize(Roles = "Company")]
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<TrainerProfileResponse>> getTrainerProfile(Guid id)
        {
            var reult = await TrainerService.GetTrainerProfileResponseAsync(id.ToString());
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
            return Ok(result);
        }

        [Authorize(Roles = "Trainer")]
        [HttpGet("TrainingSession/{id:guid}")]
        public async Task<ActionResult<TrainingSessionDetailesResponse>> GetTrainingSessionDetails(Guid id)
        {
            var result = await TrainerService.GetTrainingSessionDetailesResponseAsync(id.ToString().ToUpper());
            return Ok(result);
        }


    }
}
