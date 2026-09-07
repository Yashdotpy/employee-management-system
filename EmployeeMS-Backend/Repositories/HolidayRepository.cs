using EmployeeAPI.DTOs;
using EmployeeAPI.Models;
using Microsoft.Data.SqlClient;

namespace EmployeeAPI.Repositories;

public class HolidayRepository : IHolidayRepository
{
    private readonly string _connectionString;

    public HolidayRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection is not configured.");
    }

    public List<Holiday> GetAll()
    {
        var holidays = new List<Holiday>();
        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand(@"
            SELECT HolidayId, HolidayDate, Name, CreatedAt
            FROM Holidays ORDER BY HolidayDate", connection);
        connection.Open();
        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            holidays.Add(new Holiday
            {
                HolidayId = Convert.ToInt32(reader["HolidayId"]),
                HolidayDate = Convert.ToDateTime(reader["HolidayDate"]),
                Name = reader["Name"]?.ToString() ?? string.Empty,
                CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
            });
        }
        return holidays;
    }

    public void Add(HolidayCreateDto holiday)
    {
        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand(@"
            INSERT INTO Holidays (HolidayDate, Name)
            VALUES (@HolidayDate, @Name)", connection);
        command.Parameters.AddWithValue("@HolidayDate", holiday.HolidayDate.Date);
        command.Parameters.AddWithValue("@Name", holiday.Name.Trim());
        connection.Open();
        try { command.ExecuteNonQuery(); }
        catch (SqlException ex) when (ex.Number is 2601 or 2627)
        {
            throw new InvalidOperationException("A holiday already exists for this date.");
        }
    }

    public bool Delete(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand("DELETE FROM Holidays WHERE HolidayId = @HolidayId", connection);
        command.Parameters.AddWithValue("@HolidayId", id);
        connection.Open();
        return command.ExecuteNonQuery() > 0;
    }

    public bool IsHoliday(DateTime date)
    {
        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand("SELECT COUNT(*) FROM Holidays WHERE HolidayDate = @HolidayDate", connection);
        command.Parameters.AddWithValue("@HolidayDate", date.Date);
        connection.Open();
        return Convert.ToInt32(command.ExecuteScalar()) > 0;
    }
}
