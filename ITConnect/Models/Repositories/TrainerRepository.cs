using ITConnect.Data;
using ITConnect.Data.ResponsesModel;
using ITConnect.Models.Repository.cs;
using Microsoft.EntityFrameworkCore;

namespace ITConnect.Models.Repositories
{
    public class TrainerRepository : GenericRepository<Trainer>, ITrainerRepository
    {
        public TrainerRepository(ApplicationDbContext dbContext) : base(dbContext) { }

        public Task<PagedResults<TrainerResponse>> GetTrainerResponsePageAsync(string? searchstring, int currentpage, int pagesize)
        {
            var query = GetTrainerResponseQuery(searchstring);
            return PaginationExtensions.ToPagedResultAsync(query, currentpage, pagesize);

        }
        public async Task<TrainerProfileResponse> GetTrainerResponseProfileAsync(string trainerid)
        {
            var profile= await GetProfileBaseQuery(trainerid).SingleOrDefaultAsync();
            if (profile == null)
                return null;
            profile.TrainingsList= await GetTrainingsQuery(trainerid).ToListAsync();

            profile.StudentsList=await GetStudentsQuery(trainerid).ToListAsync();
            return profile;
            


        }
        private IQueryable<TrainerResponse> GetTrainerResponseQuery(string searchstring)
        {
            var query = Db.Trainers.AsQueryable();
            if (!string.IsNullOrEmpty(searchstring))
                query = query.Where(x => x.Name.Contains(searchstring) ||
                x.User.Email.Contains(searchstring) ||
                x.Specialization.Contains(searchstring)
                );
            var result = query.Select(t => new TrainerResponse()
            {
                Specialization = t.Specialization,
                Email = t.User.Email,
                phone = t.User.PhoneNumber,
                TrainerName = t.Name,
                UserId = t.Id,
                CountStudents = Db.Trainees.Where(x => x.TrainingSession.TrainerId.Equals(t.Id)).Count(),
                TrainingSessionsCount = Db.TrainingSessions.Where(x => x.TrainerId.Equals(t.Id)).Count()

            });

            return result;
        }

        private IQueryable<TrainingSummaryDto> GetTrainingsQuery(string trainerId)
        {
            return Db.TrainingSessions
                .Where(ts => ts.TrainerId == trainerId)
                .Select(ts => new TrainingSummaryDto
                {
                    Title = ts.Name,
                    StartDate = ts.StartDate,
                    EndDate = ts.EndDate,
                    Location = ts.Location,
                    StudentCount = Db.Trainees.Count(tr => tr.TrainingSessionId == ts.Id)
                });
        }
        private IQueryable<TraineeUnderTrainerDto> GetStudentsQuery(string trainerId)
        {
            return Db.Trainees
                .Where(t => t.TrainingSession.Trainer.Id == trainerId)
                .Select(t => new TraineeUnderTrainerDto
                {
                    StudentName = t.Name,
                    TrainingTitle = t.TrainingSession.Name
                });
        }
        private IQueryable<TrainerProfileResponse> GetProfileBaseQuery(string trainerId)
        {
            return Db.Trainers
                .Where(x => x.Id == trainerId)
                .Select(t => new TrainerProfileResponse
                {
                    Id = t.Id,
                    Name = t.Name,
                    Email = t.User.Email,
                    Phone = t.User.PhoneNumber,
                    Specialty = t.Specialization,
                    TotalTrainingsCount = Db.TrainingSessions.Count(ts => ts.TrainerId == trainerId),
                    TotalStudentsCount = Db.Trainees.Count(tr => tr.TrainingSession.TrainerId == trainerId),
                    TotalTasksCount = Db.ApplicationTask.Count(at => at.TrainerId == trainerId)
                });
        }



        //private IQueryable<TrainerProfileResponse> GetTrainerProfileResponseQuery(string trainerid)
        //{
        //    var Query = Db.Trainers.Where(x => x.UserId.Equals(trainerid)).Select(t => new TrainerProfileResponse()
        //    {
        //        Email = t.User.Email,
        //        Id = t.UserId,
        //        Name = t.Name,
        //        Phone = t.User.PhoneNumber,
        //        Specialty = t.Specialization,
        //        TotalTrainingsCount = Db.TrainingSessions.Where(x => x.TrainerId.Equals(t.UserId)).Count(),
        //        TotalStudentsCount = Db.Trainees.Where(x => x.TrainingSession.TrainerId.Equals(t.UserId)).Count(),

        //        TotalTasksCount = Db.ApplicationTask.Where(x => x.TrainerId.Equals(trainerid)).Count(),
        //        StudentsList = Db.Trainees.Where(t => t.TrainingSession.Trainer.UserId.Equals(trainerid))
        //              .Select(t => new TraineeUnderTrainerDto()
        //              {
        //                  StudentName = t.Name,
        //                  TrainingTitle = t.TrainingSession.Name
        //              }),
        //        TrainingsList = Db.TrainingSessions.Where(x => x.TrainerId.Equals(trainerid)).Select(x => new TrainingSummaryDto()
        //        {
        //            EndDate = x.EndDate,
        //            Location = x.Location,
        //            StartDate = x.StartDate,
        //            StudentCount = Db.Trainees.Count(s => s.TrainingSessionId.Equals(x.Id)),
        //            Title = x.Name,
        //        })
        //    });
        //    return Query;

        //}
    }
}
