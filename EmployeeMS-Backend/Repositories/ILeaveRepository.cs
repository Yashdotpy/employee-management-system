using EmployeeAPI.DTOs;
using EmployeeAPI.Models;

namespace EmployeeAPI.Repositories;

public interface ILeaveRepository
{
    List<LeaveRequest> GetAll();
    List<LeaveRequest> GetByEmployee(int employeeId);
    void Create(int employeeId, LeaveCreateDto leave);
    bool UpdateStatus(int leaveId, string status);
}
