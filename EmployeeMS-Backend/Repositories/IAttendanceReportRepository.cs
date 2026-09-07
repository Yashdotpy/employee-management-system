using EmployeeAPI.DTOs;

namespace EmployeeAPI.Repositories;

public interface IAttendanceReportRepository
{
    AttendanceTodayReportDto GetTodayReport();

    List<EmployeeAttendanceSummaryDto>
        GetEmployeeAttendanceSummary(int year, int month);
}