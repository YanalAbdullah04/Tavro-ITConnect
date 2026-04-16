using ITConnect.Data.ResponsesModel.DataResponsesModel;

namespace ITConnect.Services
{
    public interface ICompanyDashboardService
    {
        Task<CompanyDashboardSummaryResponse> GetSummaryAsync();
        Task<List<ApplicationResponse>> GetApplicationsAsync(int count = 5);
        Task<List<ActiveTrainingProgressResponse>> GetActiveTrainingProgressAsync(int count = 5);
        Task<List<RecentActivityResponse>> GetRecentActivityAsync(int count = 10);
        Task<List<ApplicationTrendResponse>> GetApplicationTrendAsync(int months = 6);
        Task<UserCompositionResponse> GetUserCompositionAsync();
        Task<List<BranchPerformanceResponse>> GetBranchPerformanceAsync(int count = 10);
    }
}
