using EmployeeAPI.DTOs;
using EmployeeAPI.Models;

namespace EmployeeAPI.Repositories;

public interface IEmployeeRepository
{
    List<Employee> GetAllEmployees();

    Employee? GetEmployeeById(int id);

    EmployeeDto? GetEmployeeByEmail(string email);

    void AddEmployee(EmployeeCreateDto employee);

    bool UpdateEmployee(
        int id,
        EmployeeUpdateDto employee);

    bool DeleteEmployee(int id);
}