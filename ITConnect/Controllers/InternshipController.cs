using ITConnect.Data.ResponsesModel;
using ITConnect.Data.ResponsesModel.TraineeResponseModels;
using ITConnect.Iservices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITConnect.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InternshipController : ControllerBase
    {
        private readonly IInternshipService internshipService;

        public InternshipController(IInternshipService internshipService)
        {
            this.internshipService = internshipService;
        }

        //unauth 
        [HttpGet]
        public async Task<ActionResult<PagedResults<InternshipResponse>>> GetAll(
            [FromQuery] string? searchstring,
            [FromQuery] string? Location,       
            [FromQuery] string? Track,
            [FromQuery] int currentpage = 1,
            [FromQuery] int pagesize = 5)
        {
            var result = await internshipService.GetAllInternshipsAsync(searchstring, Location, Track, currentpage, pagesize);
            return Ok(result);
        }
        [Authorize]
        [HttpGet("{Postid:guid}")]
        public async Task<ActionResult<InternShipDetailesResponse>> Get(Guid Postid)
        {
            var result = await internshipService.GetInternshipDetailesAsync(Postid.ToString());
            
            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [Authorize(Roles = "Trainee")]
        [HttpPost("{Postid:guid}/apply")]
        public async Task<ActionResult> Apply(Guid Postid)
        {
            var result = await internshipService.ApplyAsync(Postid.ToString());
            if (!result)
            {
                return BadRequest("Could not complete the application. Either the post was not found, you are not authorized, or you have already applied.");
            }

            return Ok("Application submitted successfully.");
        }
    }
}
