using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITConnect.Migrations
{
    /// <inheritdoc />
    public partial class removeextraidintrainer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationTask_Trainers_TrainerId",
                table: "ApplicationTask");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskSubmissions_Trainers_SubmittedTo",
                table: "TaskSubmissions");

            migrationBuilder.DropForeignKey(
                name: "FK_Trainers_AspNetUsers_UserId",
                table: "Trainers");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingSessions_Trainers_TrainerId",
                table: "TrainingSessions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Trainers",
                table: "Trainers");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Trainers");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "Trainers",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Trainers",
                table: "Trainers",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationTask_Trainers_TrainerId",
                table: "ApplicationTask",
                column: "TrainerId",
                principalTable: "Trainers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskSubmissions_Trainers_SubmittedTo",
                table: "TaskSubmissions",
                column: "SubmittedTo",
                principalTable: "Trainers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Trainers_AspNetUsers_Id",
                table: "Trainers",
                column: "Id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingSessions_Trainers_TrainerId",
                table: "TrainingSessions",
                column: "TrainerId",
                principalTable: "Trainers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApplicationTask_Trainers_TrainerId",
                table: "ApplicationTask");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskSubmissions_Trainers_SubmittedTo",
                table: "TaskSubmissions");

            migrationBuilder.DropForeignKey(
                name: "FK_Trainers_AspNetUsers_Id",
                table: "Trainers");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingSessions_Trainers_TrainerId",
                table: "TrainingSessions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Trainers",
                table: "Trainers");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "Trainers",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Trainers",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Trainers",
                table: "Trainers",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ApplicationTask_Trainers_TrainerId",
                table: "ApplicationTask",
                column: "TrainerId",
                principalTable: "Trainers",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskSubmissions_Trainers_SubmittedTo",
                table: "TaskSubmissions",
                column: "SubmittedTo",
                principalTable: "Trainers",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Trainers_AspNetUsers_UserId",
                table: "Trainers",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingSessions_Trainers_TrainerId",
                table: "TrainingSessions",
                column: "TrainerId",
                principalTable: "Trainers",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
