using ITConnect.Data.ResponsesModel;
using ITConnect.Iservices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ITConnect.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyService companyService;

        public CompanyController(ICompanyService companyService)
        {
            this.companyService = companyService;
        }

        [HttpGet]
        public async Task<ActionResult<List<CompanyResponse>>> GetCompanies()
        {
            var result = await companyService.GetCompanyResponseAsync();
            return Ok(result);
        }

        //[HttpGet("track/{companyId}")]
        [HttpGet("{companyId}/tracks")]
        public async Task<ActionResult<List<CompanyTrackResponse>>> GetCompanyTracks(string companyId)
        {
            var result = await companyService.GetCompanyTracksAsync(companyId);
            return Ok(result);
        }

        [Authorize(Roles = "Company")]
        [HttpGet("trainees")]
        public async Task<ActionResult<List<CompanyTraineeResponse>>> GetCompanyTrainees([FromQuery] string? searchQuery)
        {
            var result = await companyService.GetCompanyTraineesAsync(searchQuery);
            return Ok(result);
        }

        [Authorize(Roles = "Company")]
        [HttpDelete("trainees/{id}")]
        public async Task<IActionResult> DeleteCompanyTrainee(string id)
        {
            var result = await companyService.DeleteCompanyTraineeAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
