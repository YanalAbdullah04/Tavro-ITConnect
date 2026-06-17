using System.Security.Cryptography;
using System.Text.Json;
using ITConnect.Data.ResponsesModel.GitHubResponseModels;
using ITConnect.Models;
using ITConnect.Models.Repository.cs;
using ITConnect.Services.Iservices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;

namespace ITConnect.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GitHubController : ControllerBase
{
    public const string InstallStatePurpose = "ITConnect.GitHub.InstallState.v1";

    private readonly IGitHubService _gitHubService;
    private readonly IGenericRepository<Trainee> _traineeRepository;
    private readonly IUserContext _userContext;
    private readonly IConfiguration _configuration;
    private readonly IDataProtector _stateProtector;

    public GitHubController(
        IGitHubService gitHubService,
        IGenericRepository<Trainee> traineeRepository,
        IUserContext userContext,
        IConfiguration configuration,
        IDataProtectionProvider dataProtectionProvider)
    {
        _gitHubService = gitHubService;
        _traineeRepository = traineeRepository;
        _userContext = userContext;
        _configuration = configuration;
        _stateProtector = dataProtectionProvider.CreateProtector(InstallStatePurpose);
    }

    [Authorize(Roles = "Trainee")]
    [HttpGet("install-url")]
    public async Task<ActionResult<GitHubInstallUrlResponse>> GetInstallUrl()
    {
        var traineeId = _userContext.TraineeId;
        var appSlug = _configuration["GitHubConfig:AppSlug"];
        if (string.IsNullOrWhiteSpace(traineeId))
            return Unauthorized();
        if (string.IsNullOrWhiteSpace(appSlug) || GetFrontendOrigin() == null)
            return Problem("GitHub App integration configuration is incomplete.", statusCode: StatusCodes.Status503ServiceUnavailable);

        var trainee = await _traineeRepository.GetByIdAsync(traineeId);
        if (trainee != null && !trainee.GithubInstallationId.HasValue && !string.IsNullOrWhiteSpace(trainee.GithubUsername))
        {
            try
            {
                var installation = await _gitHubService.GetUserInstallationAsync(trainee.GithubUsername);
                if (installation != null)
                {
                    trainee.GithubInstallationId = installation.InstallationId;
                    await _traineeRepository.UpdateAsync(trainee.Id, trainee);
                }
            }
            catch (Exception)
            {
                // Fallback to normal flow if lookup fails
            }
        }

        // Re-check after potential auto-connect
        if (trainee != null && trainee.GithubInstallationId.HasValue)
        {
            var dummyExpiresAt = DateTime.UtcNow.AddMinutes(GetStateLifetimeMinutes());
            var dummyState = _stateProtector.Protect(JsonSerializer.Serialize(new GitHubInstallState
            {
                TraineeId = traineeId,
                ExpiresAtUnixSeconds = new DateTimeOffset(dummyExpiresAt).ToUnixTimeSeconds(),
                Nonce = Convert.ToHexString(RandomNumberGenerator.GetBytes(24))
            }));
            
            var localCallbackUrl = $"{Request.Scheme}://{Request.Host}/api/GitHub/callback?installation_id={trainee.GithubInstallationId.Value}&state={Uri.EscapeDataString(dummyState)}";

            return Ok(new GitHubInstallUrlResponse
            {
                InstallUrl = localCallbackUrl,
                StateExpiresAt = dummyExpiresAt
            });
        }

        var expiresAt = DateTime.UtcNow.AddMinutes(GetStateLifetimeMinutes());
        var state = _stateProtector.Protect(JsonSerializer.Serialize(new GitHubInstallState
        {
            TraineeId = traineeId,
            ExpiresAtUnixSeconds = new DateTimeOffset(expiresAt).ToUnixTimeSeconds(),
            Nonce = Convert.ToHexString(RandomNumberGenerator.GetBytes(24))
        }));
        var installUrl = $"https://github.com/apps/{Uri.EscapeDataString(appSlug)}/installations/new?state={Uri.EscapeDataString(state)}";

        return Ok(new GitHubInstallUrlResponse
        {
            InstallUrl = installUrl,
            StateExpiresAt = expiresAt
        });
    }

    [AllowAnonymous]
    [HttpGet("callback")]
    public async Task<IActionResult> Callback(
        [FromQuery] long installation_id,
        [FromQuery] string? state,
        [FromQuery] string? setup_action)
    {
        if (string.IsNullOrWhiteSpace(state) || installation_id <= 0)
            return CallbackPage(false, "GitHub returned invalid callback parameters.", StatusCodes.Status400BadRequest);

        GitHubInstallState? installState;
        try
        {
            installState = JsonSerializer.Deserialize<GitHubInstallState>(_stateProtector.Unprotect(state));
        }
        catch (Exception exception) when (exception is CryptographicException or JsonException)
        {
            return CallbackPage(false, "The GitHub connection request is invalid or has been tampered with.", StatusCodes.Status400BadRequest);
        }

        if (installState == null ||
            string.IsNullOrWhiteSpace(installState.TraineeId) ||
            string.IsNullOrWhiteSpace(installState.Nonce) ||
            DateTimeOffset.UtcNow.ToUnixTimeSeconds() > installState.ExpiresAtUnixSeconds)
        {
            return CallbackPage(false, "The GitHub connection request has expired.", StatusCodes.Status400BadRequest);
        }

        try
        {
            var installation = await _gitHubService.GetInstallationAsync(installation_id);
            if (installation == null)
                return CallbackPage(false, "The GitHub App installation could not be verified.", StatusCodes.Status400BadRequest);

            var trainee = await _traineeRepository.GetByIdIgnoreFiltersAsync(installState.TraineeId);
            if (trainee == null)
                return CallbackPage(false, "The intended trainee account could not be found.", StatusCodes.Status404NotFound);

            trainee.GithubInstallationId = installation.InstallationId;
            await _traineeRepository.UpdateIgnoreFiltersAsync(trainee.Id, trainee);

            return CallbackPage(true, "GitHub connected successfully.", StatusCodes.Status200OK);
        }
        catch (HttpRequestException)
        {
            return CallbackPage(false, "GitHub could not verify the installation. Please try again.", StatusCodes.Status502BadGateway);
        }
        catch (InvalidOperationException)
        {
            return CallbackPage(false, "GitHub App integration configuration is incomplete.", StatusCodes.Status503ServiceUnavailable);
        }
    }

    [Authorize(Roles = "Trainee")]
    [HttpGet("status")]
    public async Task<ActionResult<GitHubStatusResponse>> GetStatus()
    {
        var traineeId = _userContext.TraineeId;
        if (string.IsNullOrWhiteSpace(traineeId)) return Unauthorized();

        var trainee = await _traineeRepository.GetByIdAsync(traineeId);
        if (trainee == null) return NotFound(new { message = "Trainee was not found." });

        GitHubInstallationMetadata? installation = null;

        if (!trainee.GithubInstallationId.HasValue && !string.IsNullOrWhiteSpace(trainee.GithubUsername))
        {
            try
            {
                installation = await _gitHubService.GetUserInstallationAsync(trainee.GithubUsername);
                if (installation != null)
                {
                    trainee.GithubInstallationId = installation.InstallationId;
                    await _traineeRepository.UpdateAsync(trainee.Id, trainee);
                }
            }
            catch (Exception)
            {
                // Fallback to disconnected status if lookup fails
            }
        }

        if (!trainee.GithubInstallationId.HasValue)
            return Ok(new GitHubStatusResponse { IsConnected = false });

        try
        {
            if (installation == null)
            {
                installation = await _gitHubService.GetInstallationAsync(trainee.GithubInstallationId.Value);
            }

            if (installation == null)
            {
                trainee.GithubInstallationId = null;
                await _traineeRepository.UpdateAsync(trainee.Id, trainee);
                return Ok(new GitHubStatusResponse { IsConnected = false, IsStale = true });
            }

            return Ok(new GitHubStatusResponse
            {
                IsConnected = true,
                InstallationId = installation.InstallationId,
                AccountLogin = installation.AccountLogin,
                AccountAvatarUrl = installation.AccountAvatarUrl,
                AccountHtmlUrl = installation.AccountHtmlUrl,
                RepositorySelection = installation.RepositorySelection
            });
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "GitHub connection status could not be verified." });
        }
        catch (InvalidOperationException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "GitHub App integration configuration is incomplete." });
        }
    }

    [Authorize(Roles = "Trainee")]
    [HttpDelete("disconnect")]
    public async Task<IActionResult> Disconnect()
    {
        var traineeId = _userContext.TraineeId;
        if (string.IsNullOrWhiteSpace(traineeId)) return Unauthorized();

        var trainee = await _traineeRepository.GetByIdAsync(traineeId);
        if (trainee == null) return NotFound(new { message = "Trainee was not found." });
        if (!trainee.GithubInstallationId.HasValue) return NoContent();

        var installationId = trainee.GithubInstallationId.Value;

        // Clear the local linkage first so the trainee is always "disconnected"
        // from our side, even if the GitHub API call below fails.
        trainee.GithubInstallationId = null;
        await _traineeRepository.UpdateAsync(trainee.Id, trainee);

        // Remove the installation from the user's GitHub account so that
        // reconnecting triggers a fresh "Install & Authorize" flow.
        try
        {
            await _gitHubService.DeleteInstallationAsync(installationId);
        }
        catch (Exception exception) when (exception is HttpRequestException or InvalidOperationException)
        {
            // The local record is already cleared.  Return 207 so the frontend
            // knows the disconnect succeeded locally but GitHub removal failed.
            return StatusCode(StatusCodes.Status207MultiStatus, new
            {
                message = "Disconnected locally, but the GitHub App installation could not be removed. " +
                          "You may need to uninstall it manually from your GitHub settings."
            });
        }

        return NoContent();
    }

    [Authorize(Roles = "Trainer,Trainee")]
    [HttpGet("repositories/{traineeId:guid}")]
    public async Task<IActionResult> GetRepositories(string traineeId)
    {
        var trainee = await GetAccessibleConnectedTrainee(traineeId);
        if (trainee.Result != null) return trainee.Result;

        try
        {
            return Content(await _gitHubService.GetRepositoriesAsync(trainee.Value!.GithubInstallationId!.Value), "application/json");
        }
        catch (Exception exception) when (exception is HttpRequestException or InvalidOperationException)
        {
            return await HandleGitHubExceptionAsync(exception, trainee.Value!);
        }
    }

    [Authorize(Roles = "Trainer,Trainee")]
    [HttpGet("branches/{traineeId:guid}/{owner}/{repoName}")]
    public async Task<IActionResult> GetBranches(string traineeId, string owner, string repoName)
    {
        var trainee = await GetAccessibleTrainee(traineeId);
        if (trainee.Result != null) return trainee.Result;

        try
        {
            return Content(await _gitHubService.GetBranchesAsync(trainee.Value!.GithubInstallationId, owner, repoName), "application/json");
        }
        catch (Exception exception) when (exception is HttpRequestException or InvalidOperationException)
        {
            return await HandleGitHubExceptionAsync(exception, trainee.Value!);
        }
    }

    [Authorize(Roles = "Trainer,Trainee")]
    [HttpGet("content/{traineeId:guid}/{owner}/{repoName}/{branch}")]
    [HttpGet("content/{traineeId:guid}/{owner}/{repoName}/{branch}/{*filePath}")]
    public async Task<IActionResult> GetFileContent(string traineeId, string owner, string repoName, string branch, string? filePath = null)
    {
        var trainee = await GetAccessibleTrainee(traineeId);
        if (trainee.Result != null) return trainee.Result;

        try
        {
            return Content(
                await _gitHubService.GetFileContentAsync(trainee.Value!.GithubInstallationId, owner, repoName, branch, filePath),
                "application/json");
        }
        catch (Exception exception) when (exception is HttpRequestException or InvalidOperationException)
        {
            return await HandleGitHubExceptionAsync(exception, trainee.Value!);
        }
    }

    private async Task<ActionResult<Trainee>> GetAccessibleConnectedTrainee(string traineeId)
    {
        var trainee = await _traineeRepository.GetByIdAsync(traineeId);
        if (trainee == null) return NotFound(new { message = "Trainee GitHub access was not found." });
        if (!trainee.GithubInstallationId.HasValue)
            return Conflict(new { message = "Trainee has not connected the GitHub App." });
        return trainee;
    }

    private async Task<ActionResult<Trainee>> GetAccessibleTrainee(string traineeId)
    {
        var trainee = await _traineeRepository.GetByIdAsync(traineeId);
        if (trainee == null) return NotFound(new { message = "Trainee GitHub access was not found." });
        return trainee;
    }

    private async Task<IActionResult> HandleGitHubExceptionAsync(Exception exception, Trainee trainee)
    {
        if (exception is HttpRequestException httpException && httpException.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            if (trainee.GithubInstallationId.HasValue)
            {
                trainee.GithubInstallationId = null;
                await _traineeRepository.UpdateAsync(trainee.Id, trainee);
            }
            return Conflict(new { message = "Repository not found or access denied. Ensure the repository is public or connect the GitHub App." });
        }

        return GitHubAccessFailure(exception);
    }

    private ObjectResult GitHubAccessFailure(Exception exception)
    {
        if (exception is InvalidOperationException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = exception.Message });
        }

        if (exception is HttpRequestException httpException)
        {
            var code = httpException.StatusCode.HasValue ? (int)httpException.StatusCode.Value : StatusCodes.Status502BadGateway;
            return StatusCode(code, new { message = $"{httpException.Message} (GitHub API responded with {(httpException.StatusCode.HasValue ? (int)httpException.StatusCode.Value : "unknown status")})" });
        }

        return StatusCode(StatusCodes.Status502BadGateway, new { message = $"GitHub could not complete the repository request: {exception.Message}" });
    }

    private IActionResult CallbackPage(bool success, string message, int statusCode)
    {
        var frontendOrigin = GetFrontendOrigin();
        var payload = JsonSerializer.Serialize(new
        {
            type = "GITHUB_APP_INSTALLATION_RESULT",
            success,
            message
        });
        var targetOrigin = frontendOrigin == null ? "null" : JsonSerializer.Serialize(frontendOrigin);
        var postMessageScript = frontendOrigin == null
            ? string.Empty
            : $"window.opener.postMessage({payload}, {targetOrigin}); window.close();";
        var html = $$"""
            <!doctype html>
            <html>
              <head><meta charset="utf-8"><title>GitHub connection</title></head>
              <body>
                <p>{{System.Net.WebUtility.HtmlEncode(message)}}</p>
                <script>
                  if (window.opener) { {{postMessageScript}} }
                </script>
              </body>
            </html>
            """;

        return new ContentResult { Content = html, ContentType = "text/html", StatusCode = statusCode };
    }

    private string? GetFrontendOrigin()
    {
        var configuredUrl = _configuration["Frontend:BaseUrl"];
        return Uri.TryCreate(configuredUrl, UriKind.Absolute, out var uri) &&
               (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
            ? uri.GetLeftPart(UriPartial.Authority)
            : null;
    }

    private int GetStateLifetimeMinutes() =>
        int.TryParse(_configuration["GitHubConfig:StateLifetimeMinutes"], out var configured) && configured is >= 1 and <= 30
            ? configured
            : 10;

    private sealed class GitHubInstallState
    {
        public string TraineeId { get; set; } = string.Empty;
        public long ExpiresAtUnixSeconds { get; set; }
        public string Nonce { get; set; } = string.Empty;
    }
}
