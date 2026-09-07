using EmployeeAPI.DTOs;
using EmployeeAPI.Models;
using EmployeeAPI.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceRepository _repository;

    public AttendanceController(
        IAttendanceRepository repository)
    {
        _repository = repository;
    }


    // =====================================================
    // GET ALL ATTENDANCE
    // ADMIN + HR
    // =====================================================

    [HttpGet]
    [Authorize(Roles = "Admin,HR")]
    public IActionResult GetAllAttendance()
    {
        var attendance =
            _repository.GetAllAttendance();

        return Ok(attendance);
    }


    // =====================================================
    // GET ATTENDANCE BY ID
    // ADMIN + HR
    // =====================================================

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public IActionResult GetAttendanceById(int id)
    {
        var attendance =
            _repository.GetAttendanceById(id);

        if (attendance == null)
        {
            return NotFound(new
            {
                message = "Attendance record not found."
            });
        }

        return Ok(attendance);
    }


    // =====================================================
    // GET EMPLOYEE ATTENDANCE
    // ADMIN + HR
    // =====================================================

    [HttpGet("employee/{employeeId}")]
    [Authorize(Roles = "Admin,HR")]
    public IActionResult GetAttendanceByEmployee(
        int employeeId)
    {
        var attendance =
            _repository.GetAttendanceByEmployee(
                employeeId
            );

        return Ok(attendance);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Employee")]
    public IActionResult GetMyAttendance()
    {
        var employeeIdClaim =
            User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            );

        if (employeeIdClaim == null)
        {
            return Unauthorized(new
            {
                message = "Employee identity not found."
            });
        }

        if (!int.TryParse(
            employeeIdClaim.Value,
            out int employeeId))
        {
            return Unauthorized(new
            {
                message = "Invalid employee identity."
            });
        }

        var attendance =
            _repository.GetAttendanceByEmployee(
                employeeId
            );

        return Ok(attendance);
    }

    [HttpGet("my/today")]
    [Authorize(Roles = "Employee")]
    public IActionResult GetMyTodayAttendance()
    {
        if (!TryGetEmployeeId(out int employeeId, out IActionResult? error))
        {
            return error!;
        }

        var attendance = _repository.GetEmployeeTodayAttendance(employeeId);
        return attendance == null
            ? NotFound(new { message = "Employee profile not found." })
            : Ok(attendance);
    }

    [HttpPost("my/clock-in")]
    [Authorize(Roles = "Employee")]
    public IActionResult ClockIn()
    {
        if (!TryGetEmployeeId(out int employeeId, out IActionResult? error))
        {
            return error!;
        }

        try
        {
            return Ok(_repository.ClockIn(employeeId));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("my/clock-out")]
    [Authorize(Roles = "Employee")]
    public IActionResult ClockOut()
    {
        if (!TryGetEmployeeId(out int employeeId, out IActionResult? error))
        {
            return error!;
        }

        try
        {
            return Ok(_repository.ClockOut(employeeId));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private bool TryGetEmployeeId(
        out int employeeId,
        out IActionResult? error)
    {
        employeeId = 0;
        error = null;

        var employeeIdClaim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier);

        if (employeeIdClaim == null ||
            !int.TryParse(employeeIdClaim.Value, out employeeId))
        {
            error = Unauthorized(new { message = "Invalid employee identity." });
            return false;
        }

        return true;
    }


    // =====================================================
    // CREATE ATTENDANCE
    // ADMIN + HR
    // =====================================================

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public IActionResult CreateAttendance(
        AttendanceCreateDto dto)
    {
        try
        {
            _repository.AddAttendance(dto);

            return Ok(new
            {
                message =
                    "Attendance created successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message =
                    "Unable to create attendance.",
                error = ex.Message
            });
        }
    }


    // =====================================================
    // UPDATE ATTENDANCE
    // ADMIN + HR
    // =====================================================

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public IActionResult UpdateAttendance(
        int id,
        AttendanceCreateDto dto)
    {
        try
        {
            bool updated =
                _repository.UpdateAttendance(
                    id,
                    dto
                );

            if (!updated)
            {
                return NotFound(new
                {
                    message =
                        "Attendance record not found."
                });
            }

            return Ok(new
            {
                message =
                    "Attendance updated successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = "Unable to update attendance.",
                error = ex.Message
            });
        }
    }


    // =====================================================
    // DELETE ATTENDANCE
    // ADMIN + HR
    // =====================================================

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public IActionResult DeleteAttendance(int id)
    {
        bool deleted =
            _repository.DeleteAttendance(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message =
                    "Attendance record not found."
            });
        }

        return Ok(new
        {
            message =
                "Attendance deleted successfully."
        });
    }
}
