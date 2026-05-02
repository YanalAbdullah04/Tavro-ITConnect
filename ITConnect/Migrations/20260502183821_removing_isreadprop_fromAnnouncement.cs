using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ITConnect.Migrations
{
    /// <inheritdoc />
    public partial class removing_isreadprop_fromAnnouncement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "Announcements");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "Announcements",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
