using ITConnect.Data.RequestsModel.TrainerResponse;
using ITConnect.Data.ResponsesModel;
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

            var reult = await TrainerService.GetAllTrainerAsync(SearchString,CurentPage,PageSize);
            return Ok(reult);

        }

        [Authorize(Roles = "Company")]
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<List<TrainerResponse>>> getTrainerProfile(Guid id)
        {
            var reult = await TrainerService.GetTrainerProfileResponseAsync(id.ToString());
            return Ok(reult);

        }

        [Authorize(Roles = "Company,Trainer")]
        [HttpPut("Management")]
        public async Task<ActionResult<List<TrainerResponse>>> UpdateTrainerProfile(UpdateTrainerRequest updateTrainerRequest)
        {
            var reult = await TrainerService.UpdateTrainerProfileAsync(updateTrainerRequest);
            return NoContent();

        }

        [Authorize(Roles = "Company")]
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<List<TrainerResponse>>> deletetrainer(Guid id)
        {
            var reult = await TrainerService.DeleteTrainerAsync(id.ToString());
            return NoContent();

        }




    }
}
