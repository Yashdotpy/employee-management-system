using EmployeeAPI.Models;

namespace EmployeeAPI.DTOs;

public class EmployeeAttendanceTodayDto
{
    public Attendance? Attendance { get; set; }

    public TimeSpan ShiftStartTime { get; set; }

    public TimeSpan ShiftEndTime { get; set; }

    public int RequiredWorkMinutes { get; set; } = 540;

    public bool IsOffDay { get; set; }

    public bool IsHoliday { get; set; }
}
