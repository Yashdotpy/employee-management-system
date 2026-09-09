using System.ComponentModel.DataAnnotations;

namespace EmployeeAPI.DTOs;

public class LeaveCreateDto
{
    [Required] public DateTime StartDate { get; set; }
    [Required] public DateTime EndDate { get; set; }
    [Required] public string LeaveType { get; set; } = string.Empty;
    [Required, StringLength(500)] public string Reason { get; set; } = string.Empty;
}
