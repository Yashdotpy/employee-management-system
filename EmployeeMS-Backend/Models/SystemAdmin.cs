namespace EmployeeAPI.Models;

public class SystemAdmin
{
    public int AdminId { get; set; }

    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;
}