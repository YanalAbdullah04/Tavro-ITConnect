using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;

namespace ITConnect.Middleware
{
    public class GlobalExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

        public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception has occurred.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var statusCode = (int)HttpStatusCode.InternalServerError;
            var message = "An unexpected error occurred.";

            var currentEx = exception;
            bool isConstraintViolation = false;

            while (currentEx != null)
            {
                if (currentEx is DbUpdateException)
                {
                    // Continue inspection of inner exception
                }
                else if (currentEx is SqlException sqlEx)
                {
                    if (sqlEx.Number == 547)
                    {
                        isConstraintViolation = true;
                        break;
                    }
                }
                else if (currentEx.Message.Contains("FK_") || 
                         currentEx.Message.Contains("constraint") || 
                         currentEx.Message.Contains("foreign key") || 
                         currentEx.Message.Contains("conflict") ||
                         currentEx.Message.Contains("conflicted"))
                {
                    isConstraintViolation = true;
                    break;
                }

                currentEx = currentEx.InnerException;
            }

            if (isConstraintViolation)
            {
                statusCode = (int)HttpStatusCode.BadRequest;
                message = "cant delete the elemnt because it has another element depends on it , ";
            }

            context.Response.StatusCode = statusCode;

            var result = JsonSerializer.Serialize(new { message });
            return context.Response.WriteAsync(result);
        }
    }
}
