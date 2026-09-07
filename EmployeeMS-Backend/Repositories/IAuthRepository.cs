using EmployeeAPI.DTOs;

namespace EmployeeAPI.Repositories;

public interface IAuthRepository
{
    LoginResponseDto? Login(LoginDto dto);

    LoginResponseDto? RefreshToken(string refreshToken);

    bool RevokeRefreshToken(string refreshToken);
}