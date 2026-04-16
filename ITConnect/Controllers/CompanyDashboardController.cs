using ITConnect.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITConnect.Controllers
{
    [Route("api/company-dashboard")]
    [ApiController]
    [Authorize(Roles = "Company")]
    public class CompanyDashboardController : ControllerBase
    {
        private readonly ICompanyDashboardService _companyDashboardService;

        public CompanyDashboardController(ICompanyDashboardService companyDashboardService)
        {
            _companyDashboardService = companyDashboardService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            try
            {
                var result = await _companyDashboardService.GetSummaryAsync();
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recent-applications")]
        public async Task<IActionResult> GetRecentApplications([FromQuery] int count = 5)
        {
            try
            {
                var result = await _companyDashboardService.GetApplicationsAsync(count);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("active-training-progress")]
        public async Task<IActionResult> GetActiveTrainingProgress([FromQuery] int count = 5)
        {
            try
            {
                var result = await _companyDashboardService.GetActiveTrainingProgressAsync(count);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recent-activity")]
        public async Task<IActionResult> GetRecentActivity([FromQuery] int count = 10)
        {
            try
            {
                var result = await _companyDashboardService.GetRecentActivityAsync(count);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("application-trend")]
        public async Task<IActionResult> GetApplicationTrend([FromQuery] int months = 6)
        {
            try
            {
                var result = await _companyDashboardService.GetApplicationTrendAsync(months);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user-composition")]
        public async Task<IActionResult> GetUserComposition()
        {
            try
            {
                var result = await _companyDashboardService.GetUserCompositionAsync();
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("branch-performance")]
        public async Task<IActionResult> GetBranchPerformance([FromQuery] int count = 10)
        {
            try
            {
                var result = await _companyDashboardService.GetBranchPerformanceAsync(count);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}