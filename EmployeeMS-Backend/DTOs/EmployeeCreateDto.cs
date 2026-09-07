using System.ComponentModel.DataAnnotations;

namespace EmployeeAPI.DTOs;

public class EmployeeCreateDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Department { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public decimal Salary { get; set; }

    [Required]
    public DateTime DateOfJoining { get; set; }
}