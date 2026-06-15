using ITConnect.Data.ResponsesModel.GitHubResponseModels;

namespace ITConnect.Services.Iservices
{
    public interface IGitHubService
    {
        Task<string> GetInstallationTokenAsync(long installationId);
        Task<GitHubInstallationMetadata?> GetInstallationAsync(long installationId);
        Task<string> GetRepositoriesAsync(long installationId);
        Task<string> GetBranchesAsync(long installationId, string owner, string repoName);
        Task<string> GetFileContentAsync(long installationId, string owner, string repoName, string branch, string? filePath);
    }
}
