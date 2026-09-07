using EmployeeAPI.DTOs;
using EmployeeAPI.Models;

namespace EmployeeAPI.Repositories;

public interface IAttendanceRepository
{
    List<Attendance> GetAllAttendance();

    Attendance? GetAttendanceById(int id);

    List<Attendance> GetAttendanceByEmployee(int employeeId);

    EmployeeAttendanceTodayDto? GetEmployeeTodayAttendance(int employeeId);

    EmployeeAttendanceTodayDto ClockIn(int employeeId);

    EmployeeAttendanceTodayDto ClockOut(int employeeId);

    void MarkMissingAttendanceAsAbsent(DateTime throughDate);

    void AddAttendance(AttendanceCreateDto attendance);

    bool UpdateAttendance(
        int id,
        AttendanceCreateDto attendance);

    bool DeleteAttendance(int id);
}
