namespace EmployeeAPI.Models;

public class RefreshToken
{
    public int RefreshTokenId { get; set; }

    public int EmployeeId { get; set; }

    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? RevokedAt { get; set; }
}