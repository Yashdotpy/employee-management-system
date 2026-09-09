using EmployeeAPI.DTOs;
using EmployeeAPI.Models;

namespace EmployeeAPI.Repositories;

public interface IEmployeeRepository
{
    List<Employee> GetAllEmployees();

    Employee? GetEmployeeById(int id);

    EmployeeDto? GetEmployeeByEmail(string email);

    List<EmployeeDirectoryDto> GetEmployeeDirectory();

    string? ChangePassword(int employeeId, string currentPassword, string newPassword);

    void AddEmployee(EmployeeCreateDto employee);

    bool UpdateEmployee(
        int id,
        EmployeeUpdateDto employee);

    bool DeleteEmployee(int id);
}
