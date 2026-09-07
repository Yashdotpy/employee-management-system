using System.ComponentModel.DataAnnotations;

namespace EmployeeAPI.DTOs;

public class CreateUserDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(Admin|HR)$", ErrorMessage = "Role must be Admin or HR.")]
    public string Role { get; set; } = string.Empty;
}