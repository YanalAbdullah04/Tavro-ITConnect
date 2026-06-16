using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITConnect.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTrainingStatusInCompleteToActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE TrainingSessions SET TrainingStatus = 'Active' WHERE TrainingStatus = 'InComplete'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE TrainingSessions SET TrainingStatus = 'InComplete' WHERE TrainingStatus = 'Active'");
        }
    }
}
