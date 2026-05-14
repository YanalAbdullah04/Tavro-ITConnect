using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITConnect.Migrations
{
    /// <inheritdoc />
    public partial class AddGithubInstallationId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "GithubInstallationId",
                table: "Trainees",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GithubInstallationId",
                table: "Trainees");
        }
    }
}
