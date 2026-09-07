using EmployeeAPI.DTOs;
using EmployeeAPI.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeAPI.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminAuthController : ControllerBase
{
    private readonly IAdminAuthRepository _repository;

    public AdminAuthController(
        IAdminAuthRepository repository)
    {
        _repository = repository;
    }

    // =====================================================
    // ADMIN LOGIN
    // =====================================================

    [HttpPost("login")]
    public IActionResult Login(AdminLoginDto dto)
    {
        var response = _repository.Login(dto);

        if (response == null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid admin username or password."
            });
        }

        return Ok(response);
    }

    // =====================================================
    // ADMIN REFRESH TOKEN
    // =====================================================

    [HttpPost("refresh")]
    public IActionResult RefreshToken(
        RefreshTokenDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
        {
            return BadRequest(new
            {
                message =
                    "Refresh token is required."
            });
        }

        var response =
            _repository.RefreshToken(
                dto.RefreshToken
            );

        if (response == null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid or expired refresh token."
            });
        }

        return Ok(response);
    }

    // =====================================================
    // ADMIN LOGOUT
    // =====================================================

    [HttpPost("logout")]
    public IActionResult Logout(
        RefreshTokenDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
        {
            return BadRequest(new
            {
                message =
                    "Refresh token is required."
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
                message =
                    "Refresh token not found."
            });
        }

        return Ok(new
        {
            message =
                "Admin logged out successfully."
        });
    }
}