using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Models;
using ITConnect.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ITConnect.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TraineeController : ControllerBase
    {
        private readonly ITraineeService traineeService;

        public TraineeController(ITraineeService traineeService)
        {
            this.traineeService = traineeService;
        }
        [Authorize(Roles ="Trainee")]
        [HttpGet("Profile")]
        public async Task<ActionResult<TraineeProfileRequestAndResponse>> GetTraineeProfile()
        {
            var result = await traineeService.GetTraineeProfileAsync(null);
            if (result == null)
                return NotFound();
            return Ok(result);

        }
        [Authorize(Roles ="Company,Trainer")]
        [HttpGet("Profile/{id:guid}")]
        public async Task<ActionResult<TraineeProfileRequestAndResponse>> GetTraineeProfile(Guid id)//for company  and Trainer acess
        {
            var result = await traineeService.GetTraineeProfileAsync(id.ToString());
            if (result == null)
                return NotFound();
            return Ok(result);

        }
        [Authorize(Roles ="Trainee")]
        [HttpPut("Profile")]
        public async Task<ActionResult<TraineeProfileRequestAndResponse>> UpdateTraineeProfile(TraineeProfileRequestAndResponse traineeProfileRequestAndResponse)//for company  and Trainer acess
        {

            var result = await traineeService.UpdateTraineeProfileAsync(traineeProfileRequestAndResponse);
            if (!result)
                return BadRequest();
            return NoContent();

        }

        [Authorize(Roles = "Trainee")]//not tetsted
        [HttpGet("Dashboard")]
        public async Task<ActionResult<TraineeOverveiwDashboardResponse>> TraineeOverVeiw()
        {
            var result = await traineeService.dashboardoverveiwasync();
            return Ok(result);
        }
        [Authorize(Roles = "Trainee")]
        [HttpGet("TaskAssignment/{id:guid}/Task")]//not tested
        public async Task<ActionResult<TraineeTaskDetailesResponse>> GetTaskDetailes(Guid id)//id is taskassigement id
        {
            var result = await traineeService.GetTaskDetailesAsync(id.ToString(), null);
            if (result == null)
                return NotFound();
            return Ok(result);
        }
    }
}
