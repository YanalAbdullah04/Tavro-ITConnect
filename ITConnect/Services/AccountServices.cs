using ITConnect.Data;
using ITConnect.Data.RequestsModel.AuthDTOs;
using ITConnect.Data.RequestsModel.TrainerDto;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models;
using ITConnect.Models.Repositories.UnitOfWork;
using ITConnect.Services.Iservices;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ITConnect.Services
{
    public class AccountServices : IAccountServices
    {
        private readonly RoleManager<IdentityRole> RoleManager;
        private readonly UserManager<IdentityUser> UserManager;
        private readonly IConfiguration Configuration;
        private readonly ApplicationDbContext db;
        private readonly IRegisterationUnitOfWork UnitOfWork;
        private readonly IUserContext userContext;
        private readonly IEmailService emailService;

        public AccountServices(RoleManager<IdentityRole> _roleManager,
            UserManager<IdentityUser> _userManager,
            IConfiguration Configuration,
            ApplicationDbContext Db,
            IRegisterationUnitOfWork unitOfWork,
            IUserContext userContext,
            IEmailService emailService)
        {
            RoleManager = _roleManager;
            UserManager = _userManager;
            this.Configuration = Configuration;
            db = Db;
            UnitOfWork = unitOfWork;
            this.userContext = userContext;
            this.emailService = emailService;
        }
        public async Task<(IdentityResult Result, IdentityUser User)> RegisterBaseEntityAsync(RegisterationRequest registerationRequest, string role)
        {

            var userexist = await UserManager.FindByEmailAsync(registerationRequest.Email);
            if (userexist != null)
                return (IdentityResult.Failed(
                     new IdentityError()
                     {
                         Code = "doublicated user",
                         Description = $"user with the email {registerationRequest.Email} already exist "
                     }), null);

            IdentityUser newuser = new IdentityUser()
            {
                Email = registerationRequest.Email,
                UserName = registerationRequest.Email,
                PhoneNumber = registerationRequest.Phone,

            };

            var result = await UserManager.CreateAsync(newuser, registerationRequest.Password);
            if (!result.Succeeded)
                return (IdentityResult.Failed(
                    new IdentityError()
                    {
                        Code = "somthing went wrong",
                        Description = "somthing went wrong."

                    }), null);
            var roleresult = await UserManager.AddToRoleAsync(newuser, role);
            if (!roleresult.Succeeded)
                return (IdentityResult.Failed(
                    new IdentityError()
                    {
                        Code = "rolefaliur",
                        Description = "unable to add role"

                    }), null);
            return (IdentityResult.Success, newuser);
        }

        public async Task<RegistrationAuthResponse> RegisterCompanyAsync(RegisterationRequest registerationRequest)
        {
            using (var transaction = await UnitOfWork.BeginTransactionAsync())
            {
                try
                {

                    var (result, user) = await RegisterBaseEntityAsync(registerationRequest, "Company");
                    if (!result.Succeeded)
                    {
                        return new RegistrationAuthResponse() { IsSuccess = false, Errors = result.Errors.Select(x => x.Description).ToList() };
                    }


                    Company company = new Company()
                    {
                        Id = user.Id,
                        Name = registerationRequest.Name,



                    };
                    if (!await UnitOfWork.CompanyRepository.AddAsync(company))
                        return new()
                        {
                            IsSuccess = false,
                            Errors = { "failed to addcompany  profile" }
                        };


                    var jwt = await GenerateJWTAsync(user, "Company");
                    RegistrationAuthResponse response = new RegistrationAuthResponse()
                    {
                        Token = jwt.Token,
                        Expiration = jwt.Expiration,
                        IsSuccess = true,



                    };
                    await UnitOfWork.CompleteAsync();

                    await UnitOfWork.CommitTransactionAsync();

                    return response;


                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }
        public async Task<RegistrationAuthResponse> RegisterTraineeAsync(RegisterationRequest registerationRequest)
        {
            using (var transaction = await UnitOfWork.BeginTransactionAsync())
            {
                try
                {

                    var (result, user) = await RegisterBaseEntityAsync(registerationRequest, "Trainee");
                    if (!result.Succeeded)
                    {
                        return new RegistrationAuthResponse() { IsSuccess = false, Errors = result.Errors.Select(x => x.Description).ToList() };
                    }
                    Trainee trainee = new Trainee()
                    {
                        Id = user.Id,
                        Name = registerationRequest.Name,

                    };

                    if (!await UnitOfWork.TraineeRepository.AddAsync(trainee))
                        return new()
                        {
                            IsSuccess = false,
                            Errors = { "failed to add  profile" }
                        };


                    var jwt = await GenerateJWTAsync(user, "Trainee");
                    RegistrationAuthResponse response = new RegistrationAuthResponse()
                    {
                        Token = jwt.Token,
                        Expiration = jwt.Expiration,
                        IsSuccess = true,

                    };

                    await UnitOfWork.CompleteAsync();

                    await UnitOfWork.CommitTransactionAsync();

                    return response;


                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }




        public async Task<RegistrationAuthResponse> RegisterTrainerAsync(TrainerRegistrationRequest TrainerRegisterationRequest)
        {
            using (var transaction = await UnitOfWork.BeginTransactionAsync())
            {
                try
                {
                    RegisterationRequest registerationRequest = new RegisterationRequest()
                    {
                        Email = TrainerRegisterationRequest.Email,
                        Name = TrainerRegisterationRequest.FullName,
                        Phone = TrainerRegisterationRequest.Phone,
                        Password = new Guid().ToString() + "123abcABC",
                    };
                    var (result, user) = await RegisterBaseEntityAsync(registerationRequest, "Trainer");
                    if (!result.Succeeded)
                    {
                        return new RegistrationAuthResponse() { IsSuccess = false, Errors = result.Errors.Select(x => x.Description).ToList() };
                    }
                    Trainer Trainer = new Trainer()
                    {
                        Id = user.Id,
                        Name = registerationRequest.Name,
                        CompanyId = userContext.CompanyId,
                        Specialization = TrainerRegisterationRequest.Specialization,



                    };

                    if (!await UnitOfWork.TrainerRepository.AddAsync(Trainer))
                        return new()
                        {
                            IsSuccess = false,
                            Errors = { "failed to add  profile" }
                        };


                    var jwt = await GenerateJWTAsync(user, "Trainer");
                    RegistrationAuthResponse response = new RegistrationAuthResponse()
                    {
                        Token = jwt.Token,
                        Expiration = jwt.Expiration,
                        IsSuccess = true,

                    };
                    await UnitOfWork.CompleteAsync();

                    await UnitOfWork.CommitTransactionAsync();
                    
                    var companyUser = await UserManager.FindByIdAsync(userContext.CompanyId);
                    var companyProfile = await UnitOfWork.CompanyRepository.GetByIdAsync(userContext.CompanyId);
                    var companyName = companyProfile?.Name ?? "ITConnect System";

                    var baseUrl = "http://localhost:8080";
             

                    var pagePath = "/profile-setting";


                    var fullLink = $"{baseUrl}{pagePath}?token={jwt.Token}";

                    await emailService.SendEmailAsync(companyName, "yanalabdullh@gmail.com", Trainer.Name, user.Email, "ITConnect Invitation Link", fullLink);

                    return response;


                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }


        public async Task<LoginAuthResponse> Login(LoginDto logInDto)
        {
            var user = await UserManager.FindByNameAsync(logInDto.Email);
            if (user == null)
                return new LoginAuthResponse() { Errors = new() { $"user name {logInDto.Email} is not found" } };
            var userrole = await UserManager.GetRolesAsync(user);

            if (await UserManager.CheckPasswordAsync(user, logInDto.Password))
            {
                var tokenvalue = await GenerateJWTAsync(user, userrole.FirstOrDefault());
                return new LoginAuthResponse()
                {
                    Expiration = tokenvalue.Expiration,
                    IsSuccess = true,
                    Token = tokenvalue.Token,
                    //add referesh token 

                };
            }

            return new LoginAuthResponse() { Errors = new() { "wrong password" } };


        }
        //token generation 
        public async Task<RegistrationAuthResponse> GenerateJWTAsync(IdentityUser user, string userrole)
        {
            var authclaims = new List<Claim>() {
                new Claim(ClaimTypes.Name,user.UserName),
                new Claim(ClaimTypes.NameIdentifier,user.Id),
                new Claim(JwtRegisteredClaimNames.Email,user.Email),
                new Claim(JwtRegisteredClaimNames.Sub,user.Email),
                new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role,userrole)


            };

            var authSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(Configuration["JWT:Secret"]));

            var token = new JwtSecurityToken(
            expires: DateTime.UtcNow.AddMinutes(1), // 5 - 10mins
            claims: authclaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            var jwtoken = new JwtSecurityTokenHandler().WriteToken(token);
            // add the referesh tooken later 
            RegistrationAuthResponse response = new RegistrationAuthResponse() { Token = jwtoken, Expiration = token.ValidTo };
            return response;
        }




        public async Task<bool> UpdateUserIdentityAsync(string userId, string email, string phone)
        {
            var user = await UserManager.FindByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            user.Email = email;
            user.PhoneNumber = phone;

            var result = await UserManager.UpdateAsync(user);
            if (result.Succeeded)
                return true;
            return false;
        }

        public async Task<bool> SettingTrainerProfileAsync(TrainerProfileSettingRequest trainerProfileSettingRequest)
        {

            using (var transaction =  await UnitOfWork.BeginTransactionAsync())
            {
               
                var userId = userContext.RawId;
                if (string.IsNullOrEmpty(userId)) return false;

                var user = await UserManager.FindByIdAsync(userId);
                if (user == null) return false;
                try
                {

                    await UserManager.RemovePasswordAsync(user);
                    var addPasswordResult = await UserManager.AddPasswordAsync(user, trainerProfileSettingRequest.Password);

                    if (!addPasswordResult.Succeeded) return false;

                 

                    var trainer = await UnitOfWork.TrainerRepository.GetByIdAsync(userId);
                    if (trainer == null) return false;

                    trainer.Specialization = trainerProfileSettingRequest.Specialization;
                  
                    trainer.GithubUsername = trainerProfileSettingRequest.GitHubAccount;
                    trainer.ImgUrl = trainerProfileSettingRequest.ImgUrl; //غيرها تنساش 

                    
                    await UnitOfWork.CompleteAsync();
                    await UnitOfWork.CommitTransactionAsync();

                    return true;
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    return false;
                }
            }

        }
        public async Task<bool> DeleteUserAccountAsync(string userId)
        {
            var user = await UserManager.FindByIdAsync(userId);

            if (user == null)
            {
                return false;
            }

            var result = await UserManager.DeleteAsync(user);

            return result.Succeeded;
        }
    }
}
