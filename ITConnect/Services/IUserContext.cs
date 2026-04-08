namespace ITConnect.Services
{
    public interface IUserContext
    {




        string? RawId { get; }


        bool IsCompany { get; }
        bool IsTrainer { get; }


        string? CompanyId { get; }


        string? TrainerId { get; }




    }
}
