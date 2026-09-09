using System.ComponentModel.DataAnnotations;

namespace EmployeeAPI.DTOs;

public class LeaveStatusUpdateDto
{
    [Required] public string Status { get; set; } = string.Empty;
}
