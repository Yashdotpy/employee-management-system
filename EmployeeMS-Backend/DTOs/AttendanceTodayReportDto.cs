namespace EmployeeAPI.DTOs;

public class AttendanceTodayReportDto
{
    public DateTime Date { get; set; }

    public int TotalEmployees { get; set; }

    public int Present { get; set; }

    public int Absent { get; set; }

    public int HalfDay { get; set; }

    public int Leave { get; set; }
}