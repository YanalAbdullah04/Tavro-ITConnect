using ITConnect.Data.RequestsModel.AuthDTOs;
using ITConnect.Data.RequestsModel.TrainerDto;
using ITConnect.Data.ResponsesModel;
using ITConnect.Services;
using ITConnect.Services.Iservices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace ITConnect.Controllers
{
    [Route("api/Account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountServices AccountServices;
        private readonly IEmailService emailService;

        public AccountController(IAccountServices accountServices,IEmailService emailService)
        {
            AccountServices = accountServices;
            this.emailService = emailService;
        }

        [HttpPost("Register/Company")]
        public async Task<ActionResult<RegistrationAuthResponse>> Companysignup(RegisterationRequest registerationRequest)
        {
            var result = await AccountServices.RegisterCompanyAsync(registerationRequest);
            try
            {
                
                if (!result.IsSuccess)
                    return BadRequest(result);
                return Created("", result);

            }
            catch (Exception ex) {
                return BadRequest(result);
            }
        }
        [HttpPost("Register/Trainee")]
        public async Task<ActionResult<RegistrationAuthResponse>> Traineesignup(RegisterationRequest registerationRequest)
        {
            var result = await AccountServices.RegisterTraineeAsync(registerationRequest);
            try
            {
                
                if (!result.IsSuccess)
                    return BadRequest(result);
                return Created("", result);

            }
            catch (Exception ex) {
                return BadRequest(result);
            }
        }
        [Authorize(Roles = "Company")]
        [HttpPost("Register/Trainer")]
        public async Task<ActionResult<RegistrationAuthResponse>> Trainersignup(TrainerRegistrationRequest trainerRegistrationRequest)
        {
            var result = await AccountServices.RegisterTrainerAsync(trainerRegistrationRequest);
            try
            {
                
                if (!result.IsSuccess)
                    return BadRequest(result);
                return Created("", result);

            }
            catch (Exception ex) {
                return BadRequest(result);
            }
        }
        [Authorize(Roles = "Trainer")]
        [HttpPost("Trainer/profile-setting")]
        public async Task<ActionResult<RegistrationAuthResponse>> settingTrainerProfile(TrainerProfileSettingRequest trainerProfileSettingRequest)
        {
            bool result = false; ;
            try
            {
             result = await AccountServices.SettingTrainerProfileAsync(trainerProfileSettingRequest);



                return Ok();


            }
            catch (Exception ex) {
                return BadRequest(result);
            }
        }


        [HttpPost("Login")]
        public async Task<ActionResult<LoginAuthResponse>> login(LoginDto loginDto)
        {
            var result = await AccountServices.Login(loginDto);
            if (!result.IsSuccess) 
                return BadRequest(result);
            return Ok(result);


        }
        [HttpPost("testingEmailSender")]
        public async Task<ActionResult<LoginAuthResponse>> email()
        {
            try
            {
             
                await emailService.SendEmailAsync("ITConnect System", "company@gmail.com", "yanal abdulah", "yanalabdullah402@gmail.com", "Welcome!", "click the link to register");
                return Ok(new { message = "Email sent successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to send email", error = ex.Message });
            }
        }

    }
}
