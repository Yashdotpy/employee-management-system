using System.ComponentModel.DataAnnotations;

namespace EmployeeAPI.DTOs;

public class AttendanceCreateDto
{
    [Required]
    public int EmployeeId { get; set; }

    [Required]
    public DateTime AttendanceDate { get; set; }

    public TimeSpan? CheckInTime { get; set; }

    public TimeSpan? CheckOutTime { get; set; }

    [Required]
    public string Status { get; set; } = string.Empty;

    public string? Remarks { get; set; }
}