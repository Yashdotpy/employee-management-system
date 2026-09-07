using System.IdentityModel.Tokens.Jwt;
using EmployeeAPI.DTOs;
using System.Text;
using EmployeeAPI.Models;
using Microsoft.Data.SqlClient;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;

namespace EmployeeAPI.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;

    public AuthRepository(IConfiguration configuration)
    {
        _configuration = configuration;

        _connectionString =
            configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "DefaultConnection is not configured.");
    }

    private SqlConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }


    // =====================================================
    // LOGIN
    // =====================================================

    public LoginResponseDto? Login(LoginDto dto)
    {
        using SqlConnection connection = CreateConnection();

        string query = @"
            SELECT
                EmployeeId,
                FullName,
                Email,
                PasswordHash,
                Role
            FROM Employees
            WHERE Email = @Email";

        using SqlCommand command = new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@Email",
            dto.Email
        );

        connection.Open();

        using SqlDataReader reader = command.ExecuteReader();

        if (!reader.Read())
        {
            return null;
        }

        string storedHash =
            reader["PasswordHash"].ToString() ?? string.Empty;

        bool isPasswordValid =
            BCrypt.Net.BCrypt.Verify(
                dto.Password,
                storedHash
            );

        if (!isPasswordValid)
        {
            return null;
        }

        Employee employee = new Employee
        {
            EmployeeId =
                Convert.ToInt32(reader["EmployeeId"]),

            FullName =
                reader["FullName"].ToString()
                ?? string.Empty,

            Email =
                reader["Email"].ToString()
                ?? string.Empty,

            PasswordHash = storedHash,

            Role =
                reader["Role"].ToString()
                ?? "Employee"
        };

        string token = GenerateJwtToken(employee);

        string refreshToken =
            GenerateRefreshToken();

        SaveRefreshToken(
            employee.EmployeeId,
            refreshToken
        );

        return new LoginResponseDto
        {
            Token = token,

            RefreshToken = refreshToken,

            Id = employee.EmployeeId,

            Name = employee.FullName,

            Email = employee.Email,

            Role = employee.Role
        };
    }

    // =====================================================
    // CREATE PRIVILEGED USER
    // ADMIN / HR
    // =====================================================

    public string? CreatePrivilegedUser(CreateUserDto dto)
    {
        if (dto.Role != "Admin" && dto.Role != "HR")
        {
            return "Only Admin or HR can be created from admin dashboard.";
        }

        using SqlConnection connection = CreateConnection();

        connection.Open();

        // Check whether email already exists
        string existsQuery = @"
            SELECT COUNT(*)
            FROM Employees
            WHERE Email = @Email";

        using SqlCommand existsCommand =
            new SqlCommand(existsQuery, connection);

        existsCommand.Parameters.AddWithValue(
            "@Email",
            dto.Email
        );

        int count =
            Convert.ToInt32(existsCommand.ExecuteScalar());

        if (count > 0)
        {
            return "Email already exists.";
        }

        string hashedPassword =
            BCrypt.Net.BCrypt.HashPassword(dto.Password);

        string insertQuery = @"
            INSERT INTO Employees
            (
                FullName,
                Email,
                PasswordHash,
                Role
            )
            VALUES
            (
                @FullName,
                @Email,
                @PasswordHash,
                @Role
            )";

        using SqlCommand insertCommand =
            new SqlCommand(insertQuery, connection);

        insertCommand.Parameters.AddWithValue(
            "@FullName",
            dto.FullName
        );

        insertCommand.Parameters.AddWithValue(
            "@Email",
            dto.Email
        );

        insertCommand.Parameters.AddWithValue(
            "@PasswordHash",
            hashedPassword
        );

        insertCommand.Parameters.AddWithValue(
            "@Role",
            dto.Role
        );

        insertCommand.ExecuteNonQuery();

        return null;
    }

    // =====================================================
    // GENERATE REFRESH TOKEN
    // =====================================================

    private string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];

        RandomNumberGenerator.Fill(randomBytes);

        return Convert.ToBase64String(randomBytes);
    }


    // =====================================================
    // SAVE REFRESH TOKEN
    // =====================================================

    private void SaveRefreshToken(
        int employeeId,
        string refreshToken)
    {
        using SqlConnection connection = CreateConnection();

        string query = @"
        INSERT INTO RefreshTokens
        (
            EmployeeId,
            Token,
            ExpiresAt
        )
        VALUES
        (
            @EmployeeId,
            @Token,
            @ExpiresAt
        )";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@EmployeeId",
            employeeId
        );

        command.Parameters.AddWithValue(
            "@Token",
            refreshToken
        );

        command.Parameters.AddWithValue(
            "@ExpiresAt",
            DateTime.UtcNow.AddDays(7)
        );

        connection.Open();

        command.ExecuteNonQuery();
    }

    // =====================================================
    // GENERATE JWT
    // =====================================================

    private string GenerateJwtToken(Employee employee)
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
                employee.EmployeeId.ToString()
            ),

            new Claim(
                ClaimTypes.Name,
                employee.FullName
            ),

            new Claim(
                ClaimTypes.Email,
                employee.Email
            ),

            new Claim(
                ClaimTypes.Role,
                employee.Role
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
                expires: DateTime.Now.AddMinutes(
                    Convert.ToDouble(
                        jwtSettings["ExpiryMinutes"]
                    )
                ),
                signingCredentials: credentials
            );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    // =====================================================
    // REFRESH ACCESS TOKEN
    // =====================================================

    public LoginResponseDto? RefreshToken(
        string refreshToken)
    {
        using SqlConnection connection =
            CreateConnection();

        string query = @"
        SELECT
            rt.EmployeeId,
            e.FullName,
            e.Email,
            e.Role
        FROM RefreshTokens rt
        INNER JOIN Employees e
            ON rt.EmployeeId = e.EmployeeId
        WHERE rt.Token = @Token
          AND rt.ExpiresAt > @Now
          AND rt.RevokedAt IS NULL";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@Token",
            refreshToken
        );

        command.Parameters.AddWithValue(
            "@Now",
            DateTime.UtcNow
        );

        connection.Open();

        using SqlDataReader reader =
            command.ExecuteReader();

        if (!reader.Read())
        {
            return null;
        }

        Employee employee = new Employee
        {
            EmployeeId =
                Convert.ToInt32(
                    reader["EmployeeId"]
                ),

            FullName =
                reader["FullName"].ToString()
                ?? string.Empty,

            Email =
                reader["Email"].ToString()
                ?? string.Empty,

            Role =
                reader["Role"].ToString()
                ?? "Employee"
        };

        string newAccessToken =
            GenerateJwtToken(employee);

        string newRefreshToken =
            GenerateRefreshToken();

        reader.Close();

        // Revoke old refresh token

        string revokeQuery = @"
        UPDATE RefreshTokens
        SET RevokedAt = @Now
        WHERE Token = @Token";

        using SqlCommand revokeCommand =
            new SqlCommand(
                revokeQuery,
                connection
            );

        revokeCommand.Parameters.AddWithValue(
            "@Now",
            DateTime.UtcNow
        );

        revokeCommand.Parameters.AddWithValue(
            "@Token",
            refreshToken
        );

        revokeCommand.ExecuteNonQuery();

        // Save new refresh token

        string insertQuery = @"
        INSERT INTO RefreshTokens
        (
            EmployeeId,
            Token,
            ExpiresAt
        )
        VALUES
        (
            @EmployeeId,
            @Token,
            @ExpiresAt
        )";

        using SqlCommand insertCommand =
            new SqlCommand(
                insertQuery,
                connection
            );

        insertCommand.Parameters.AddWithValue(
            "@EmployeeId",
            employee.EmployeeId
        );

        insertCommand.Parameters.AddWithValue(
            "@Token",
            newRefreshToken
        );

        insertCommand.Parameters.AddWithValue(
            "@ExpiresAt",
            DateTime.UtcNow.AddDays(7)
        );

        insertCommand.ExecuteNonQuery();

        return new LoginResponseDto
        {
            Token = newAccessToken,

            RefreshToken = newRefreshToken,

            Id = employee.EmployeeId,

            Name = employee.FullName,

            Email = employee.Email,

            Role = employee.Role
        };
    }

    // =====================================================
    // REVOKE REFRESH TOKEN
    // =====================================================

    public bool RevokeRefreshToken(
        string refreshToken)
    {
        using SqlConnection connection =
            CreateConnection();

        string query = @"
        UPDATE RefreshTokens
        SET RevokedAt = @Now
        WHERE Token = @Token
          AND RevokedAt IS NULL";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@Now",
            DateTime.UtcNow
        );

        command.Parameters.AddWithValue(
            "@Token",
            refreshToken
        );

        connection.Open();

        int rows =
            command.ExecuteNonQuery();

        return rows > 0;
    }
}