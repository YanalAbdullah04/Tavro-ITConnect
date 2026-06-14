using ITConnect.Models;
using ITConnect.Models.Repository.cs;
using ITConnect.Services.Iservices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITConnect.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GitHubController : ControllerBase
    {
        private readonly IGitHubService _gitHubService;
        private readonly IGenericRepository<Trainee> _traineeRepository;

        public GitHubController(IGitHubService gitHubService, IGenericRepository<Trainee> traineeRepository)
        {
            _gitHubService = gitHubService;
            _traineeRepository = traineeRepository;
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] long installation_id, [FromQuery] string state)
        {
            if (string.IsNullOrEmpty(state) || installation_id <= 0)
            {
                return BadRequest("Invalid callback parameters.");
            }

            var traineeId = state;
            // We use GetByIdIgnoreFiltersAsync because this callback endpoint is anonymous (unauthenticated).
            // When GitHub redirects back to this URL, there is no JWT present. 
            // The EF Core Global Query Filter on Trainee requires an authenticated UserContext,
            // so we must bypass it using IgnoreQueryFilters in the repository to retrieve the trainee.
            var trainee = await _traineeRepository.GetByIdIgnoreFiltersAsync(traineeId);

            if (trainee == null)
            {
                return NotFound("Trainee not found.");
            }

            trainee.GithubInstallationId = installation_id;
            await _traineeRepository.UpdateIgnoreFiltersAsync(traineeId, trainee);

            var script = @"
                <script>
                    if (window.opener) {
                        window.opener.postMessage({ type: 'GITHUB_APP_INSTALLED', success: true }, '*');
                        window.close();
                    } else {
                        document.write('GitHub App installed successfully. You can close this tab.');
                    }
                </script>";

            return Content(script, "text/html");
        }

        [AllowAnonymous]
        [HttpGet("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            var result = await _gitHubService.TestConnectionAsync();
            return Content(result, "text/plain");
        }

        [Authorize(Roles = "Trainer,Trainee")]
        [HttpGet("repositories/{traineeId}")]
        public async Task<IActionResult> GetRepositories(string traineeId)
        {
            try
            {
                Console.WriteLine($"[GitHubController] GetRepositories initiated for trainee: {traineeId}");
                var trainee = await _traineeRepository.GetByIdAsync(traineeId);
                if (trainee == null || !trainee.GithubInstallationId.HasValue)
                {
                    Console.WriteLine($"[GitHubController] GetRepositories failed: trainee {traineeId} not found or no GithubInstallationId.");
                    return BadRequest("Trainee has not installed the GitHub App.");
                }

                var repositoriesJson = await _gitHubService.GetRepositoriesAsync(trainee.GithubInstallationId.Value);
                return Content(repositoriesJson, "application/json");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GitHubController] GetRepositories exception: {ex.Message}\n{ex.StackTrace}");
                return BadRequest($"Error fetching repositories: {ex.Message}");
            }
        }

        [Authorize(Roles = "Trainer,Trainee")]
        [HttpGet("branches/{traineeId}/{owner}/{repoName}")]
        public async Task<IActionResult> GetBranches(string traineeId, string owner, string repoName)
        {
            try
            {
                Console.WriteLine($"[GitHubController] GetBranches initiated for trainee: {traineeId}, owner: {owner}, repo: {repoName}");
                var trainee = await _traineeRepository.GetByIdAsync(traineeId);
                if (trainee == null || !trainee.GithubInstallationId.HasValue)
                {
                    Console.WriteLine($"[GitHubController] GetBranches failed: trainee {traineeId} not found or no GithubInstallationId.");
                    return BadRequest("Trainee has not installed the GitHub App.");
                }

                var branchesJson = await _gitHubService.GetBranchesAsync(trainee.GithubInstallationId.Value, owner, repoName);
                return Content(branchesJson, "application/json");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GitHubController] GetBranches exception: {ex.Message}\n{ex.StackTrace}");
                return BadRequest($"Error fetching branches: {ex.Message}");
            }
        }

        [Authorize(Roles = "Trainer,Trainee")]
        [HttpGet("content/{traineeId}/{owner}/{repoName}/{branch}")]
        [HttpGet("content/{traineeId}/{owner}/{repoName}/{branch}/{*filePath}")]
        public async Task<IActionResult> GetFileContent(string traineeId, string owner, string repoName, string branch, string filePath = null)
        {
            try
            {
                Console.WriteLine($"[GitHubController] GetFileContent initiated. trainee: {traineeId}, owner: {owner}, repo: {repoName}, branch: {branch}, path: '{filePath}'");
                var trainee = await _traineeRepository.GetByIdAsync(traineeId);
                if (trainee == null || !trainee.GithubInstallationId.HasValue)
                {
                    Console.WriteLine($"[GitHubController] GetFileContent failed: trainee {traineeId} not found or no GithubInstallationId.");
                    return BadRequest("Trainee has not installed the GitHub App.");
                }

                var contentJson = await _gitHubService.GetFileContentAsync(trainee.GithubInstallationId.Value, owner, repoName, branch, filePath);
                return Content(contentJson, "application/json");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GitHubController] GetFileContent exception: {ex.Message}\n{ex.StackTrace}");
                return BadRequest($"Error fetching file content: {ex.Message}");
            }
        }
    }
}
