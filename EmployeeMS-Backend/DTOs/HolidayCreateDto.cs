using System.ComponentModel.DataAnnotations;

namespace EmployeeAPI.DTOs;

public class HolidayCreateDto
{
    [Required]
    public DateTime HolidayDate { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
}
