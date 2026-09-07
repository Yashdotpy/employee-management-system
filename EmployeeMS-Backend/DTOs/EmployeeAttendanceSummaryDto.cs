namespace EmployeeAPI.DTOs;

public class EmployeeAttendanceSummaryDto
{
    public int EmployeeId { get; set; }

    public string EmployeeName { get; set; } = string.Empty;

    public int Present { get; set; }

    public int Absent { get; set; }

    public int HalfDay { get; set; }

    public int Leave { get; set; }

    public int TotalDays { get; set; }

    public decimal AttendancePercentage { get; set; }
}