using ITConnect.Data.ResponsesModel.GitHubResponseModels;
using ITConnect.Services.Iservices;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;

namespace ITConnect.Services
{
    public class GitHubService : IGitHubService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _memoryCache;
        private readonly IConfiguration _configuration;

        public GitHubService(IHttpClientFactory httpClientFactory, IMemoryCache memoryCache, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _memoryCache = memoryCache;
            _configuration = configuration;
        }

        private string GenerateJwtToken()
        {
            var appId = _configuration["GitHubConfig:AppId"];
            var privateKeyPath = _configuration["GitHubConfig:PrivateKeyPath"];
            if (string.IsNullOrWhiteSpace(appId) || string.IsNullOrWhiteSpace(privateKeyPath))
                throw new InvalidOperationException("GitHub App configuration is incomplete.");

            var resolvedPath = ResolvePrivateKeyPath(privateKeyPath);

            var pemContent = File.ReadAllText(resolvedPath);
            using var rsa = RSA.Create();
            rsa.ImportFromPem(pemContent);

            // Export the parameters so the RsaSecurityKey owns a copy of the key
            // data instead of holding a reference to the disposed RSA object.
            var key = new RsaSecurityKey(rsa.ExportParameters(true));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.RsaSha256);

            var now = DateTime.UtcNow;
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now.AddSeconds(-60)).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
                new Claim(JwtRegisteredClaimNames.Iss, appId)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = now.AddMinutes(10),
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public async Task<string> GetInstallationTokenAsync(long installationId)
        {
            var cacheKey = $"GitHubInstallationToken_{installationId}";
            if (_memoryCache.TryGetValue(cacheKey, out string? cachedToken) && !string.IsNullOrWhiteSpace(cachedToken))
            {
                return cachedToken;
            }

            var jwtToken = GenerateJwtToken();

            var client = CreateClient(jwtToken, "Bearer");

            var response = await client.PostAsync($"https://api.github.com/app/installations/{installationId}/access_tokens", null);
            
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException("GitHub rejected the installation token request.", null, response.StatusCode);
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(responseContent);
            var token = jsonDocument.RootElement.GetProperty("token").GetString()
                ?? throw new InvalidOperationException("GitHub did not return an installation token.");

            _memoryCache.Set(cacheKey, token, TimeSpan.FromMinutes(55));

            return token;
        }

        public async Task<GitHubInstallationMetadata?> GetInstallationAsync(long installationId)
        {
            var client = CreateClient(GenerateJwtToken(), "Bearer");
            var response = await client.GetAsync($"https://api.github.com/app/installations/{installationId}");
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException("GitHub could not verify the installation.", null, response.StatusCode);

            using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            var root = document.RootElement;
            var account = root.TryGetProperty("account", out var accountValue) ? accountValue : default;

            return new GitHubInstallationMetadata
            {
                InstallationId = root.GetProperty("id").GetInt64(),
                AccountLogin = GetString(account, "login"),
                AccountAvatarUrl = GetString(account, "avatar_url"),
                AccountHtmlUrl = GetString(account, "html_url"),
                RepositorySelection = GetString(root, "repository_selection")
            };
        }

        public async Task<GitHubInstallationMetadata?> GetUserInstallationAsync(string username)
        {
            var client = CreateClient(GenerateJwtToken(), "Bearer");
            var response = await client.GetAsync($"https://api.github.com/users/{Uri.EscapeDataString(username)}/installation");
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException("GitHub could not verify the user installation.", null, response.StatusCode);

            using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            var root = document.RootElement;
            var account = root.TryGetProperty("account", out var accountValue) ? accountValue : default;

            return new GitHubInstallationMetadata
            {
                InstallationId = root.GetProperty("id").GetInt64(),
                AccountLogin = GetString(account, "login"),
                AccountAvatarUrl = GetString(account, "avatar_url"),
                AccountHtmlUrl = GetString(account, "html_url"),
                RepositorySelection = GetString(root, "repository_selection")
            };
        }

        public async Task DeleteInstallationAsync(long installationId)
        {
            var client = CreateClient(GenerateJwtToken(), "Bearer");
            var response = await client.DeleteAsync($"https://api.github.com/app/installations/{installationId}");

            // 404 means the installation was already removed on GitHub's side — treat as success.
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return;
            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException("GitHub could not remove the installation.", null, response.StatusCode);
        }

        public async Task<string> GetRepositoriesAsync(long installationId)
        {
            var token = await GetInstallationTokenAsync(installationId);
            var client = CreateClient(token, "Bearer");

            var response = await client.GetAsync("https://api.github.com/installation/repositories");
            EnsureGitHubSuccess(response, "GitHub could not load repositories.");

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<string> GetBranchesAsync(long? installationId, string owner, string repoName)
        {
            string? token = null;
            if (installationId.HasValue)
            {
                try
                {
                    token = await GetInstallationTokenAsync(installationId.Value);
                }
                catch (Exception)
                {
                    // Fallback to unauthenticated request
                }
            }
            var client = CreateClient(token, token != null ? "Bearer" : null);

            var response = await client.GetAsync($"https://api.github.com/repos/{Encode(owner)}/{Encode(repoName)}/branches");
            EnsureGitHubSuccess(response, "GitHub could not load repository branches.");

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<string> GetFileContentAsync(long? installationId, string owner, string repoName, string branch, string? filePath)
        {
            string? token = null;
            if (installationId.HasValue)
            {
                try
                {
                    token = await GetInstallationTokenAsync(installationId.Value);
                }
                catch (Exception)
                {
                    // Fallback to unauthenticated request
                }
            }
            var client = CreateClient(token, token != null ? "Bearer" : null);

            var cleanPath = string.IsNullOrEmpty(filePath) ? "" : filePath.Trim('/');
            var encodedPath = string.Join("/", cleanPath.Split('/', StringSplitOptions.RemoveEmptyEntries).Select(Encode));
            var repositoryPath = $"{Encode(owner)}/{Encode(repoName)}";
            var encodedBranch = Encode(branch);
            var url = string.IsNullOrEmpty(cleanPath)
                ? $"https://api.github.com/repos/{repositoryPath}/contents?ref={encodedBranch}"
                : $"https://api.github.com/repos/{repositoryPath}/contents/{encodedPath}?ref={encodedBranch}";

            var response = await client.GetAsync(url);
            EnsureGitHubSuccess(response, "GitHub could not load repository content.");

            return await response.Content.ReadAsStringAsync();
        }

        private HttpClient CreateClient(string? token, string? authenticationScheme)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("ITconnect", "1.0"));
            if (token != null && authenticationScheme != null)
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(authenticationScheme, token);
            }
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
            client.DefaultRequestHeaders.Add("X-GitHub-Api-Version", "2022-11-28");
            return client;
        }

        private static string Encode(string value) => Uri.EscapeDataString(value);

        private static string? GetString(JsonElement element, string propertyName) =>
            element.ValueKind == JsonValueKind.Object &&
            element.TryGetProperty(propertyName, out var value) &&
            value.ValueKind == JsonValueKind.String
                ? value.GetString()
                : null;

        private static string ResolvePrivateKeyPath(string configuredPath)
        {
            // If the path is already absolute and exists, use it directly.
            if (Path.IsPathRooted(configuredPath) && File.Exists(configuredPath))
                return configuredPath;

            // Try resolving relative to common base directories.
            string[] searchBases =
            [
                AppContext.BaseDirectory,
                Directory.GetCurrentDirectory()
            ];

            foreach (var basePath in searchBases)
            {
                var candidate = Path.GetFullPath(Path.Combine(basePath, configuredPath));
                if (File.Exists(candidate))
                    return candidate;
            }

            var searched = string.Join(", ", searchBases.Select(b => Path.GetFullPath(Path.Combine(b, configuredPath))));
            throw new InvalidOperationException(
                $"GitHub App private key file was not found. Searched: {searched}");
        }

        private static void EnsureGitHubSuccess(HttpResponseMessage response, string message)
        {
            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException(message, null, response.StatusCode);
        }
    }
}
