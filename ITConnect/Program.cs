using ITConnect.Data;
using ITConnect.Iservices;
using ITConnect.Models;
using ITConnect.Models.Repositories;
using ITConnect.Models.Repositories.UnitOfWork;
using ITConnect.Models.Repository;
using ITConnect.Models.Repository.cs;
using ITConnect.Services;
using ITConnect.Services.Iservices;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


//**********CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
//***********
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{

    options.UseSqlServer(builder.Configuration.GetConnectionString("sqlcon"));
});

//identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddRoles<IdentityRole>() 
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();
//**********************************

//auth
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(op =>
{
    op.SaveToken = true;
    op.RequireHttpsMetadata = false;
    op.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["JWT:Secret"])),
        ValidateIssuer = false,
        ValidateAudience = false,

        RoleClaimType=ClaimTypes.Role,
        NameClaimType=ClaimTypes.Name,

    };

});
//**********************************************************
//user services
builder.Services.AddScoped<IGenericRepository<Company>, GenericRepository<Company>>();
builder.Services.AddScoped<IAccountServices,AccountServices>();
builder.Services.AddScoped<IRegisterationUnitOfWork, RegistrationUnitOfWork>();
builder.Services.AddScoped<IUserContext, UserContext>();
//track services

builder.Services.AddScoped<ITrackRepository, TrackRepository>();
builder.Services.AddScoped<IGenericRepository<Trainee>, GenericRepository<Trainee>>();
builder.Services.AddScoped<IGenericRepository<TrainingSession>, GenericRepository<TrainingSession>>();
builder.Services.AddScoped<ITrackService, TrackServices>();
//Training Session Services

builder.Services.AddScoped<ITrainingSessionService, TrainingSessionService>();
builder.Services.AddScoped<ITrainingSessionRepository, TrainingSessionRepository>();

// Post Services
builder.Services.AddScoped<IPostRepository,PostRepository>();
builder.Services.AddScoped<IPostService,PostService>();
builder.Services.AddScoped<IInternshipService, InternshipService>();


//applicant services
builder.Services.AddScoped<IApplicantRepository, ApplicantRepository>();
builder.Services.AddScoped<IApplicantService, ApplicantServie>();

//Trainer Services
builder.Services.AddScoped<ITrainerService, TrainerService>();
builder.Services.AddScoped<ITrainerRepository, TrainerRepository>();

//Email service
builder.Services.AddScoped<IEmailService,EmailService>();

//trainee services
builder.Services.AddScoped<ITraineeService, TraineeService>();
builder.Services.AddScoped<ITraineeRepository, TraineeRepository>();

var app = builder.Build();
app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI(); 

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

AppDbInitilizer.SeedRoles(app).Wait();

app.Run();
