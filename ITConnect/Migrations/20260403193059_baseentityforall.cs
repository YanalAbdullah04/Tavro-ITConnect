using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITConnect.Migrations
{
    /// <inheritdoc />
    public partial class baseentityforall : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Id",
                table: "Trainers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Id",
                table: "Trainees",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Id",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Id",
                table: "Trainers");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Trainees");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Companies");
        }
    }
}
