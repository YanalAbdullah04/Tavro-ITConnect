namespace ITConnect.Data.ResponsesModel.GitHubResponseModels;

public class GitHubInstallUrlResponse
{
    public string InstallUrl { get; set; } = string.Empty;
    public DateTime StateExpiresAt { get; set; }
}

public class GitHubStatusResponse
{
    public bool IsConnected { get; set; }
    public bool IsStale { get; set; }
    public long? InstallationId { get; set; }
    public string? AccountLogin { get; set; }
    public string? AccountAvatarUrl { get; set; }
    public string? AccountHtmlUrl { get; set; }
    public string? RepositorySelection { get; set; }
}

public class GitHubInstallationMetadata
{
    public long InstallationId { get; set; }
    public string? AccountLogin { get; set; }
    public string? AccountAvatarUrl { get; set; }
    public string? AccountHtmlUrl { get; set; }
    public string? RepositorySelection { get; set; }
}
