using ITConnect.Data.RequestsModel.AuthDTOs;
using ITConnect.Services;
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

        public AccountController(IAccountServices accountServices)
        {
            AccountServices = accountServices;
        }

        [HttpPost("Register/Company")]
        public async Task<IActionResult> Companysignup(RegisterationRequest registerationRequest)
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
        public async Task<IActionResult> Traineesignup(RegisterationRequest registerationRequest)
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


        [HttpPost("Login")]
        public async Task<IActionResult> login(LoginDto loginDto)
        {
            var result = await AccountServices.Login(loginDto);
            if (!result.IsSuccess) 
                return BadRequest(result);
            return Ok(result);


        }

    }
}
