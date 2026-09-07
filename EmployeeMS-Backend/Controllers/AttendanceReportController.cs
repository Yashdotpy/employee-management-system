using EmployeeAPI.DTOs;
using EmployeeAPI.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeAPI.Controllers;

[ApiController]
[Route("api/attendance/report")]
[Authorize(Roles = "Admin,HR")]
public class AttendanceReportController
    : ControllerBase
{
    private readonly IAttendanceReportRepository _repository;

    public AttendanceReportController(
        IAttendanceReportRepository repository)
    {
        _repository = repository;
    }

    // =====================================================
    // TODAY'S ATTENDANCE REPORT
    // =====================================================

    [HttpGet("today")]
    public IActionResult GetTodayReport()
    {
        try
        {
            AttendanceTodayReportDto report =
                _repository.GetTodayReport();

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new
                {
                    message =
                        "Unable to generate attendance report.",
                    error = ex.Message
                }
            );
        }
    }

    [HttpGet("employees")]
    public IActionResult GetEmployeeAttendanceSummary(
    [FromQuery] int year,
    [FromQuery] int month)
    {
        if (year < 2000 || year > 2100)
        {
            return BadRequest(new
            {
                message = "Invalid year."
            });
        }

        if (month < 1 || month > 12)
        {
            return BadRequest(new
            {
                message = "Month must be between 1 and 12."
            });
        }

        try
        {
            var report =
                _repository.GetEmployeeAttendanceSummary(
                    year,
                    month
                );

            return Ok(report);
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new
                {
                    message =
                        "Unable to generate employee attendance summary.",
                    error = ex.Message
                }
            );
        }
    }
}