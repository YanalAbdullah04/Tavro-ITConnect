using ITConnect.Data.RequestsModel.PostDTOs;
using ITConnect.Models;
using ITConnect.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ITConnect.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {
        private readonly IPostService postService;

        public PostController(IPostService postService)
        {
            this.postService = postService;
        }


        [Authorize(Roles = "Company")]
        [HttpGet]
        public async Task<IActionResult> getall()
        {
            var result = await postService.GetAllPostsAsync();
            return Ok(result);
        }

        [Authorize(Roles = "Company")]
        [HttpPost]
        public async Task<IActionResult> addPost(AddPostRequest addPostRequest)
        {
            var result = await postService.AddPostAsync(addPostRequest);
            if (result)
                return Created();
            return BadRequest();
        }

        [Authorize(Roles = "Company")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> deletepost(Guid id)
        {
            var result = await postService.DeletePostAsync(id.ToString());
            if (result)
                return NoContent();
            return NotFound();
        }

        [Authorize(Roles = "Company")]
        [HttpPut]
        public async Task<IActionResult> updatePost(UpdatePostRequest updatePost)
        {
            var result = await postService.UpdatePostAsync(updatePost);
            if (result)
                return Created();
            return BadRequest();
        }
    }
}
