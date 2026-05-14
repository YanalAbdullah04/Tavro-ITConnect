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

            var pemContent = File.ReadAllText(privateKeyPath);
            using var rsa = RSA.Create();
            rsa.ImportFromPem(pemContent);

            var key = new RsaSecurityKey(rsa);
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
            if (_memoryCache.TryGetValue(cacheKey, out string cachedToken))
            {
                return cachedToken;
            }

            var jwtToken = GenerateJwtToken();

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("ITconnect", "1.0"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.v3+json"));

            var response = await client.PostAsync($"https://api.github.com/app/installations/{installationId}/access_tokens", null);
            
            if (!response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                throw new Exception($"Failed to retrieve GitHub installation token. Status: {response.StatusCode}, Content: {content}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var jsonDocument = JsonDocument.Parse(responseContent);
            var token = jsonDocument.RootElement.GetProperty("token").GetString();

            _memoryCache.Set(cacheKey, token, TimeSpan.FromMinutes(55));

            return token;
        }

        public async Task<string> GetRepositoriesAsync(long installationId)
        {
            var token = await GetInstallationTokenAsync(installationId);
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("ITconnect", "1.0"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.v3+json"));

            // Get repositories accessible by this installation
            var response = await client.GetAsync("https://api.github.com/installation/repositories");
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<string> GetBranchesAsync(long installationId, string owner, string repoName)
        {
            var token = await GetInstallationTokenAsync(installationId);
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("ITconnect", "1.0"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.v3+json"));

            var response = await client.GetAsync($"https://api.github.com/repos/{owner}/{repoName}/branches");
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<string> GetFileContentAsync(long installationId, string owner, string repoName, string branch, string filePath)
        {
            var token = await GetInstallationTokenAsync(installationId);
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("ITconnect", "1.0"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.v3+json"));

            var cleanPath = string.IsNullOrEmpty(filePath) ? "" : filePath.Trim('/');
            var url = string.IsNullOrEmpty(cleanPath)
                ? $"https://api.github.com/repos/{owner}/{repoName}/contents?ref={branch}"
                : $"https://api.github.com/repos/{owner}/{repoName}/contents/{cleanPath}?ref={branch}";

            Console.WriteLine($"[GitHubService] Fetching from URL: {url}");
            var response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<string> TestConnectionAsync()
        {
            try
            {
                var jwtToken = GenerateJwtToken();
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("ITconnect", "1.0"));
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtToken);
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.v3+json"));

                // 1. Get all installations for the app to verify JWT works
                var response = await client.GetAsync("https://api.github.com/app/installations");
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return $"JWT Generation succeeded, but GitHub rejected it. Error: {error}";
                }

                var content = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(content);
                var root = document.RootElement;

                if (root.GetArrayLength() == 0)
                {
                    return "JWT works! However, the GitHub App is not installed on any accounts yet. Please install it on at least one repository.";
                }

                // 2. Pick the first installation to test fetching repositories
                var firstInstallationId = root[0].GetProperty("id").GetInt64();
                var accountName = root[0].GetProperty("account").GetProperty("login").GetString();
                
                var reposJson = await GetRepositoriesAsync(firstInstallationId);
                return $"SUCCESS! App is installed on account '{accountName}' (ID: {firstInstallationId}). Here are the accessible repositories:\n{reposJson}";
            }
            catch (Exception ex)
            {
                return $"Error during testing: {ex.Message}\n{ex.StackTrace}";
            }
        }
    }
}
