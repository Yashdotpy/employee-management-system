using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

using EmployeeAPI.DTOs;
using EmployeeAPI.Models;

using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;

namespace EmployeeAPI.Repositories;

public class AdminAuthRepository : IAdminAuthRepository
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;

    public AdminAuthRepository(IConfiguration configuration)
    {
        _configuration = configuration;

        _connectionString =
            configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "DefaultConnection is not configured."
            );
    }

    private SqlConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }

    // =====================================================
    // ADMIN LOGIN
    // =====================================================

    public LoginResponseDto? Login(AdminLoginDto dto)
    {
        using SqlConnection connection = CreateConnection();

        string query = @"
            SELECT
                AdminId,
                Username,
                PasswordHash
            FROM SystemAdmins
            WHERE Username = @Username";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@Username",
            dto.Username
        );

        connection.Open();

        using SqlDataReader reader =
            command.ExecuteReader();

        if (!reader.Read())
        {
            return null;
        }

        int adminId =
            Convert.ToInt32(reader["AdminId"]);

        string username =
            reader["Username"]?.ToString()
            ?? string.Empty;

        string storedHash =
            reader["PasswordHash"]?.ToString()
            ?? string.Empty;

        bool isPasswordValid =
            BCrypt.Net.BCrypt.Verify(
                dto.Password,
                storedHash
            );

        if (!isPasswordValid)
        {
            return null;
        }

        SystemAdmin admin = new SystemAdmin
        {
            AdminId = adminId,
            Username = username,
            PasswordHash = storedHash
        };

        string accessToken =
            GenerateJwtToken(admin);

        reader.Close();

        string refreshToken =
            GenerateRefreshToken();

        SaveRefreshToken(
            connection,
            adminId,
            refreshToken
        );

        return new LoginResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            Id = admin.AdminId,
            Name = admin.Username,
            Email = string.Empty,
            Role = "Admin"
        };
    }

    // =====================================================
    // ADMIN REFRESH TOKEN
    // =====================================================

    public LoginResponseDto? RefreshToken(string refreshToken)
    {
        using SqlConnection connection = CreateConnection();

        const string query = @"
        SELECT
            art.AdminRefreshTokenId,
            art.AdminId,
            art.ExpiresAt,
            sa.Username
        FROM dbo.AdminRefreshTokens art
        INNER JOIN dbo.SystemAdmins sa
            ON art.AdminId = sa.AdminId
        WHERE art.Token = @Token
          AND art.RevokedAt IS NULL;";

        using SqlCommand command = new SqlCommand(query, connection);

        command.Parameters.Add(
            "@Token",
            System.Data.SqlDbType.NVarChar,
            500
        ).Value = refreshToken;

        connection.Open();

        using SqlDataReader reader = command.ExecuteReader();

        if (!reader.Read())
        {
            return null;
        }

        int refreshTokenId =
            Convert.ToInt32(reader["AdminRefreshTokenId"]);

        int adminId =
            Convert.ToInt32(reader["AdminId"]);

        DateTime expiresAt =
            Convert.ToDateTime(reader["ExpiresAt"]);

        string username =
            reader["Username"]?.ToString() ?? string.Empty;

        // Check refresh-token expiry
        if (expiresAt <= DateTime.UtcNow)
        {
            return null;
        }

        reader.Close();

        // -------------------------------------------------
        // Revoke old refresh token
        // -------------------------------------------------

        const string revokeQuery = @"
        UPDATE dbo.AdminRefreshTokens
        SET RevokedAt = @RevokedAt
        WHERE AdminRefreshTokenId = @Id
          AND RevokedAt IS NULL;";

        using SqlCommand revokeCommand =
            new SqlCommand(revokeQuery, connection);

        revokeCommand.Parameters.Add(
            "@RevokedAt",
            System.Data.SqlDbType.DateTime2
        ).Value = DateTime.UtcNow;

        revokeCommand.Parameters.Add(
            "@Id",
            System.Data.SqlDbType.Int
        ).Value = refreshTokenId;

        revokeCommand.ExecuteNonQuery();

        // -------------------------------------------------
        // Generate new tokens
        // -------------------------------------------------

        SystemAdmin admin = new SystemAdmin
        {
            AdminId = adminId,
            Username = username
        };

        string newAccessToken =
            GenerateJwtToken(admin);

        string newRefreshToken =
            GenerateRefreshToken();

        SaveRefreshToken(
            connection,
            adminId,
            newRefreshToken
        );

        return new LoginResponseDto
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken,
            Id = adminId,
            Name = username,
            Email = string.Empty,
            Role = "Admin"
        };
    }

    // =====================================================
    // REVOKE ADMIN REFRESH TOKEN
    // =====================================================

    public bool RevokeRefreshToken(
        string refreshToken)
    {
        using SqlConnection connection = CreateConnection();

        string query = @"
            UPDATE AdminRefreshTokens
            SET RevokedAt = @RevokedAt
            WHERE Token = @Token
              AND RevokedAt IS NULL";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@Token",
            refreshToken
        );

        command.Parameters.AddWithValue(
            "@RevokedAt",
            DateTime.UtcNow
        );

        connection.Open();

        int rowsAffected =
            command.ExecuteNonQuery();

        return rowsAffected > 0;
    }

    // =====================================================
    // SAVE ADMIN REFRESH TOKEN
    // =====================================================

    private void SaveRefreshToken(
    SqlConnection connection,
    int adminId,
    string refreshToken)
    {
        var jwtSettings =
            _configuration.GetSection("Jwt");

        int refreshTokenDays =
            Convert.ToInt32(
                jwtSettings["RefreshTokenExpiryDays"] ?? "7"
            );

        DateTime expiresAt =
            DateTime.UtcNow.AddDays(refreshTokenDays);

        const string query = @"
        INSERT INTO dbo.AdminRefreshTokens
        (
            AdminId,
            Token,
            ExpiresAt
        )
        VALUES
        (
            @AdminId,
            @Token,
            @ExpiresAt
        );";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.Add(
            "@AdminId",
            System.Data.SqlDbType.Int
        ).Value = adminId;

        command.Parameters.Add(
            "@Token",
            System.Data.SqlDbType.NVarChar,
            500
        ).Value = refreshToken;

        command.Parameters.Add(
            "@ExpiresAt",
            System.Data.SqlDbType.DateTime2
        ).Value = expiresAt;

        command.ExecuteNonQuery();
    }

    // =====================================================
    // GENERATE REFRESH TOKEN
    // =====================================================

    private string GenerateRefreshToken()
    {
        byte[] randomBytes =
            RandomNumberGenerator.GetBytes(64);

        return Convert.ToBase64String(
            randomBytes
        );
    }

    // =====================================================
    // GENERATE ADMIN JWT
    // =====================================================

    private string GenerateJwtToken(
        SystemAdmin admin)
    {
        var jwtSettings =
            _configuration.GetSection("Jwt");

        string key =
            jwtSettings["Key"]
            ?? throw new InvalidOperationException(
                "JWT Key is not configured."
            );

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                admin.AdminId.ToString()
            ),

            new Claim(
                ClaimTypes.Name,
                admin.Username
            ),

            new Claim(
                ClaimTypes.Role,
                "Admin"
            )
        };

        var securityKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key)
            );

        var credentials =
            new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256
            );

        var token =
            new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    Convert.ToDouble(
                        jwtSettings["ExpiryMinutes"]
                    )
                ),
                signingCredentials: credentials
            );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}