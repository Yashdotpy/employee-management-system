using EmployeeAPI.DTOs;
using EmployeeAPI.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthRepository _repository;

    public AuthController(IAuthRepository repository)
    {
        _repository = repository;
    }

    [HttpPost("login")]
    public IActionResult Login(LoginDto dto)
    {
        var response = _repository.Login(dto);

        if (response == null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        return Ok(response);
    }

    // =====================================================
    // REFRESH TOKEN
    // =====================================================

    [HttpPost("refresh")]
    public IActionResult RefreshToken(RefreshTokenDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
        {
            return BadRequest(new
            {
                message = "Refresh token is required."
            });
        }

        var response =
            _repository.RefreshToken(dto.RefreshToken);

        if (response == null)
        {
            return Unauthorized(new
            {
                message = "Invalid or expired refresh token."
            });
        }

        return Ok(response);
    }


    // =====================================================
    // LOGOUT
    // =====================================================

    [HttpPost("logout")]
    public IActionResult Logout(RefreshTokenDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
        {
            return BadRequest(new
            {
                message = "Refresh token is required."
            });
        }

        bool revoked =
            _repository.RevokeRefreshToken(
                dto.RefreshToken
            );

        if (!revoked)
        {
            return NotFound(new
            {
                message = "Refresh token not found."
            });
        }

        return Ok(new
        {
            message = "Logged out successfully."
        });
    }
}