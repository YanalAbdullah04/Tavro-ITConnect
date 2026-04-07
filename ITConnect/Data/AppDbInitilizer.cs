using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace ITConnect.Data
{
    public static class UserRoles

    {
        public const string Company = "Company";
        public const string Trainee = "Trainee";
        public const string Trainer = "Trainer";
    }

    public class AppDbInitilizer
    {
        public static async Task SeedRoles(IApplicationBuilder applicationBuilder)
        {

            using (var serviceScope = applicationBuilder.ApplicationServices.CreateScope())
            {
                var roleManager = serviceScope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

                if (!await roleManager.RoleExistsAsync(UserRoles.Company))
                    await roleManager.CreateAsync(new IdentityRole(UserRoles.Company));

                if (!await roleManager.RoleExistsAsync(UserRoles.Trainer))
                    await roleManager.CreateAsync(new IdentityRole(UserRoles.Trainer));

                if (!await roleManager.RoleExistsAsync(UserRoles.Trainee))
                    await roleManager.CreateAsync(new IdentityRole(UserRoles.Trainee));

                
            }
        }
    }
}

