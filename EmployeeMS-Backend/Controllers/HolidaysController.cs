using EmployeeAPI.DTOs;
using EmployeeAPI.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HolidaysController : ControllerBase
{
    private readonly IHolidayRepository _repository;
    public HolidaysController(IHolidayRepository repository) => _repository = repository;

    [HttpGet]
    public IActionResult GetAll() => Ok(_repository.GetAll());

    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public IActionResult Add(HolidayCreateDto holiday)
    {
        try { _repository.Add(holiday); return Ok(new { message = "Holiday added successfully." }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public IActionResult Delete(int id) => _repository.Delete(id)
        ? Ok(new { message = "Holiday removed successfully." })
        : NotFound(new { message = "Holiday not found." });
}
