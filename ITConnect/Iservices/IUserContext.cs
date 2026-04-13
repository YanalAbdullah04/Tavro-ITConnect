namespace ITConnect.Services.Iservices
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
