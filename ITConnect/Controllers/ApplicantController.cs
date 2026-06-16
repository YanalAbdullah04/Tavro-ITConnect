using ITConnect.Data.ResponsesModel;
using ITConnect.Iservices;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ITConnect.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class ApplicantController : ControllerBase
    {
        private readonly IApplicantService applicantService;

        public ApplicantController(IApplicantService applicantService)
        {
            this.applicantService = applicantService;
        }

        [Authorize(Roles = "Company")]
        [HttpGet]
        public async Task<ActionResult<PagedResults<ApplicantResponse>>> getall([FromQuery] string? SearchString,
            [FromQuery] ApplicantStatus? status,
            [FromQuery] Guid? TrackId,
            [FromQuery] int CurentPage=1,   
            [FromQuery]int PageSize=5
            ) {

            var reult = await applicantService.GetAllApplicantAsync(CurentPage,PageSize,SearchString,status,TrackId.ToString());
            return Ok(reult);
      
        }


        [Authorize(Roles = "Company")]
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ApplicantResponseDetailes>> getApplicantById(
            Guid id,
            [FromQuery] string traineeid,
            [FromQuery] string trainingsessionid) {
            var reult = await applicantService.GetApplicantResponseDetailesAsync(id.ToString(),traineeid,trainingsessionid);
            return Ok(reult);
      
        }

        [Authorize(Roles = "Company")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromQuery] ApplicantStatus status) {
            try
            {
                var result = await applicantService.UpdateApplicantStatusAsync(id.ToString(), status);
                if (!result)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // dont forget to addd it when developing trainee dahsboard
        //[Authorize(Roles = "Trainee")]
        //[HttpPost("{id:guid}")]
        //public async Task<ActionResult<List<ApplicantResponse>>> TempOnlyForTesting(Guid id,string traineeid,string trainingsessionid) {
        //    
      
        //}


    }
}
