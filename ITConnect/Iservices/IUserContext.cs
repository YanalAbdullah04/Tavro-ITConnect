namespace ITConnect.Services.Iservices
{
    public interface IUserContext
    {




        string? RawId { get; }


        bool IsCompany { get; }
        bool IsTrainer { get; }
        bool IsTrainee { get; }
        string? CompanyId { get; }
        string? TrainerId { get; }
        string? TraineeId { get; }




    }
}
