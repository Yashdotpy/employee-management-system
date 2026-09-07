using EmployeeAPI.DTOs;

namespace EmployeeAPI.Repositories;

public interface IAdminAuthRepository
{
    LoginResponseDto? Login(AdminLoginDto dto);

    LoginResponseDto? RefreshToken(string refreshToken);

    bool RevokeRefreshToken(string refreshToken);
}     