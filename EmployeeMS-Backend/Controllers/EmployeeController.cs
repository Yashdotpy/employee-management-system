using EmployeeAPI.DTOs;
using EmployeeAPI.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmployeeAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeRepository _repository;

    public EmployeeController(IEmployeeRepository repository)
    {
        _repository = repository;
    }

    // =====================================================
    // GET ALL EMPLOYEES
    // Admin + HR
    // =====================================================

    [Authorize(Roles = "Admin,HR")]
    [HttpGet]
    public IActionResult GetAllEmployees()
    {
        var employees = _repository.GetAllEmployees();

        return Ok(employees);
    }

    // =====================================================
    // GET EMPLOYEE BY ID
    // Admin + HR
    // =====================================================

    [Authorize(Roles = "Admin,HR")]
    [HttpGet("{id}")]
    public IActionResult GetEmployeeById(int id)
    {
        var employee = _repository.GetEmployeeById(id);

        if (employee == null)
        {
            return NotFound(new
            {
                message = "Employee not found."
            });
        }

        return Ok(employee);
    }

    // =====================================================
    // CREATE EMPLOYEE
    // Admin + HR
    // =====================================================

    [Authorize(Roles = "Admin,HR")]
    [HttpPost]
    public IActionResult AddEmployee(EmployeeCreateDto employee)
    {
        _repository.AddEmployee(employee);

        return Ok(new
        {
            message = "Employee created successfully."
        });
    }

    // =====================================================
    // UPDATE EMPLOYEE
    // Admin + HR
    // =====================================================

    [Authorize(Roles = "Admin,HR")]
    [HttpPut("{id}")]
    public IActionResult UpdateEmployee(
        int id,
        EmployeeUpdateDto employee)
    {
        bool updated = _repository.UpdateEmployee(id, employee);

        if (!updated)
        {
            return NotFound(new
            {
                message = "Employee not found."
            });
        }

        return Ok(new
        {
            message = "Employee updated successfully."
        });
    }

    // =====================================================
    // DELETE EMPLOYEE
    // Admin ONLY
    // =====================================================

    [Authorize(Roles = "Admin,HR")]
    [HttpDelete("{id}")]
    public IActionResult DeleteEmployee(int id)
    {
        bool deleted = _repository.DeleteEmployee(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "Employee not found."
            });
        }

        return Ok(new
        {
            message = "Employee deleted successfully."
        });
    }

    // =====================================================
    // MY PROFILE
    // All authenticated users
    // =====================================================

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMyProfile()
    {
        string? email =
            User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var employee =
            _repository.GetEmployeeByEmail(email);

        if (employee == null)
        {
            return NotFound(new
            {
                message = "Employee profile not found."
            });
        }

        return Ok(employee);
    }
}