using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITConnect.Migrations
{
    /// <inheritdoc />
    public partial class FixNamingWithDataPreservation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Drop all Foreign Keys first to allow column/key changes
            migrationBuilder.DropForeignKey(name: "FK_Applicants_Companies_CompanyId", table: "Applicants");
            migrationBuilder.DropForeignKey(name: "FK_Applicants_Trainees_TraineeId", table: "Applicants");
            migrationBuilder.DropForeignKey(name: "FK_Companies_AspNetUsers_UserId", table: "Companies");
            migrationBuilder.DropForeignKey(name: "FK_Posts_Companies_CompanyId", table: "Posts");
            migrationBuilder.DropForeignKey(name: "FK_TaskAssignments_Trainees_TraineeId", table: "TaskAssignments");
            migrationBuilder.DropForeignKey(name: "FK_TaskSubmissions_Trainees_SubmittedBy", table: "TaskSubmissions");
            migrationBuilder.DropForeignKey(name: "FK_Tracks_Companies_CompanyId", table: "Tracks");
            migrationBuilder.DropForeignKey(name: "FK_Trainees_AspNetUsers_UserId", table: "Trainees");
            migrationBuilder.DropForeignKey(name: "FK_Trainees_Companies_CompanyId", table: "Trainees");
            migrationBuilder.DropForeignKey(name: "FK_Trainers_Companies_CompanyId", table: "Trainers");
            migrationBuilder.DropForeignKey(name: "FK_TrainingSessions_Companies_CompanyId", table: "TrainingSessions");

            // 2. Drop the old Primary Keys
            migrationBuilder.DropPrimaryKey(name: "PK_Trainees", table: "Trainees");
            migrationBuilder.DropPrimaryKey(name: "PK_Companies", table: "Companies");
            migrationBuilder.DropColumn(name: "Id", table: "Trainees");
            migrationBuilder.DropColumn(name: "Id", table: "Companies");
            // 3. RENAME the columns (This preserves your DATA)
            migrationBuilder.RenameColumn(name: "UserId", table: "Trainees", newName: "Id");
            migrationBuilder.RenameColumn(name: "UserId", table: "Companies", newName: "Id");

            // 4. Set the columns to NOT NULL and correct type to ensure they can be PKs
            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "Trainees",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "Companies",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            // 5. Add Primary Keys back onto the renamed 'Id' columns
            migrationBuilder.AddPrimaryKey(name: "PK_Trainees", table: "Trainees", column: "Id");
            migrationBuilder.AddPrimaryKey(name: "PK_Companies", table: "Companies", column: "Id");

            // 6. Re-establish Foreign Keys pointing to the new 'Id' columns
            migrationBuilder.AddForeignKey(
                name: "FK_Applicants_Companies_CompanyId",
                table: "Applicants",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Applicants_Trainees_TraineeId",
                table: "Applicants",
                column: "TraineeId",
                principalTable: "Trainees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_AspNetUsers_Id",
                table: "Companies",
                column: "Id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Companies_CompanyId",
                table: "Posts",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskAssignments_Trainees_TraineeId",
                table: "TaskAssignments",
                column: "TraineeId",
                principalTable: "Trainees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskSubmissions_Trainees_SubmittedBy",
                table: "TaskSubmissions",
                column: "SubmittedBy",
                principalTable: "Trainees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tracks_Companies_CompanyId",
                table: "Tracks",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Trainees_AspNetUsers_Id",
                table: "Trainees",
                column: "Id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Trainees_Companies_CompanyId",
                table: "Trainees",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Trainers_Companies_CompanyId",
                table: "Trainers",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingSessions_Companies_CompanyId",
                table: "TrainingSessions",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse the logic: Rename 'Id' back to 'UserId'
            migrationBuilder.RenameColumn(name: "Id", table: "Trainees", newName: "UserId");
            migrationBuilder.RenameColumn(name: "Id", table: "Companies", newName: "UserId");

            // You would also need to revert Primary Keys and Foreign Keys here 
            // following the same pattern as above but using 'UserId'.
        }
    }
}