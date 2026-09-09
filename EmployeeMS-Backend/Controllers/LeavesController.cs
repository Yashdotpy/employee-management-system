using EmployeeAPI.DTOs;
using EmployeeAPI.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmployeeAPI.Controllers;

[ApiController, Route("api/[controller]"), Authorize]
public class LeavesController : ControllerBase
{
    private readonly ILeaveRepository _repository;
    public LeavesController(ILeaveRepository repository) => _repository = repository;
    [HttpGet, Authorize(Roles = "Admin,HR")] public IActionResult GetAll() => Ok(_repository.GetAll());
    [HttpGet("my"), Authorize(Roles = "Employee")] public IActionResult GetMy() => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? Ok(_repository.GetByEmployee(id)) : Unauthorized();
    [HttpGet("employee/{employeeId}"), Authorize(Roles = "Admin,HR")] public IActionResult GetEmployee(int employeeId) => Ok(_repository.GetByEmployee(employeeId));
    [HttpPost, Authorize(Roles = "Employee")] public IActionResult Create(LeaveCreateDto leave) { if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)) return Unauthorized(); try { _repository.Create(id, leave); return Ok(new { message = "Leave request submitted." }); } catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); } }
    [HttpPut("{id}/status"), Authorize(Roles = "Admin,HR")] public IActionResult UpdateStatus(int id, LeaveStatusUpdateDto dto) { try { return _repository.UpdateStatus(id, dto.Status) ? Ok(new { message = "Leave request updated." }) : NotFound(new { message = "Leave request not found." }); } catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); } }
}
