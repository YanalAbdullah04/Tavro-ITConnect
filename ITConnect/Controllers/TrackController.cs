using ITConnect.Data.RequestsModel.TrackDTOs;
using ITConnect.Models;
using ITConnect.Models.Repository.cs;
using ITConnect.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ITConnect.Controllers
{
    [Route("api/Track")]
    [ApiController]
    public class TrackController : ControllerBase
    {
        private readonly ITrackService trackService;

        public TrackController(ITrackService trackService)
        {
            this.trackService = trackService;
        }

        [Authorize(Roles = "Company")]
        [HttpGet]
        public async Task<IActionResult> getall() { 
         var tracks =await trackService.GetAllTracksAsync();
            if (tracks != null)
                return Ok(tracks);
            else
                return NotFound();
        
        }
        
        [HttpPost]
        public async Task<IActionResult> addtrack(AddTrackRequest addTrackRequest) { 
            
            bool result =await trackService.AddTrackAsync(addTrackRequest);
            if (result)
                return Created();
            return BadRequest();
           
            
        
        }
        [HttpPut]
        public async Task<IActionResult> UpdateTrack(UpdateTrackRequest updateTrackRequest)
        {

            bool result = await trackService.UpdateTrackAsync(updateTrackRequest);
            if (result)
                return NoContent();
            return BadRequest();
        }
        [Authorize(Roles ="Company")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteTrack(Guid id)
        {
           
            bool result = await trackService.DeleteTrackAsync(id.ToString());
            if (result)
                return NoContent();
            return NotFound();
        }





    }
}
