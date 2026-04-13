using ITConnect.Data.RequestsModel.TrainingSessionDtos;
using ITConnect.Data.ResponsesModel;
using ITConnect.Services.Iservices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ITConnect.Controllers
{
    [Route("api/TrainingSession")]
    [ApiController]
    public class TrainingSessionController : ControllerBase
    {
        private readonly ITrainingSessionService trainingSessionService;

        public TrainingSessionController(ITrainingSessionService trainingSessionService)
        {
            this.trainingSessionService = trainingSessionService;
        }
        [Authorize(Roles = "Company")]
        [HttpGet]
        public async Task<ActionResult<TrainingSessionResponse>> getall()
        {
            var result = await trainingSessionService.GetAllTrainingSessionResponseAsync();
            return Ok(result);

        }
        [Authorize(Roles = "Company")]
        [HttpPost]
        public async Task<IActionResult> addTrainingSession(CreatTrainingSessionRequest creatTrainingSessionRequest) {

            var result = await trainingSessionService.CreatTrainingSessionAsync(creatTrainingSessionRequest);
            if (result)
                return Created();
            return BadRequest();

        }
        [Authorize(Roles = "Company")]
        [HttpPut]
        public async Task<IActionResult> updateTrainingSession(UpdateTrainingSessionRequest updateTrainingSessionRequest) {

            var result =await  trainingSessionService.UpdateTrainingSessionAsync(updateTrainingSessionRequest);
            if(result)
                return Ok();
            return BadRequest();
        
        }
        [Authorize(Roles = "Company")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteTrainigSession(Guid id) {

            var result =await  trainingSessionService.DeleteTrainingSessionAsync(id.ToString());
            if(result)
                return Ok();
            return BadRequest();
        
        }

    }
}
