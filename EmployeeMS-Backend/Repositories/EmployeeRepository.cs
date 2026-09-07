using EmployeeAPI.DTOs;
using EmployeeAPI.Models;
using Microsoft.Data.SqlClient;

namespace EmployeeAPI.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly string _connectionString;

    public EmployeeRepository(IConfiguration configuration)
    {
        _connectionString =
            configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "DefaultConnection is not configured.");
    }

    private SqlConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }

    private Employee MapEmployee(SqlDataReader reader)
    {
        return new Employee
        {
            EmployeeId = Convert.ToInt32(reader["EmployeeId"]),
            FullName = reader["FullName"].ToString() ?? string.Empty,
            Email = reader["Email"].ToString() ?? string.Empty,
            Role = reader["Role"].ToString() ?? "Employee",
            Department = reader["Department"].ToString() ?? string.Empty,
            Phone = reader["Phone"].ToString() ?? string.Empty,
            Salary = Convert.ToDecimal(reader["Salary"]),
            DateOfJoining = Convert.ToDateTime(reader["DateOfJoining"]),
            ShiftStartTime = (TimeSpan)reader["ShiftStartTime"],
            ShiftEndTime = (TimeSpan)reader["ShiftEndTime"],
            CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
        };
    }


    // =====================================================
    // GET ALL EMPLOYEES
    // =====================================================

    public List<Employee> GetAllEmployees()
    {
        List<Employee> employees = new List<Employee>();

        using SqlConnection connection = CreateConnection();

        string query = @"
            SELECT
                EmployeeId,
                FullName,
                Email,
                Role,
                Department,
                Phone,
                Salary,
                DateOfJoining,
                ShiftStartTime,
                ShiftEndTime,
                CreatedAt
            FROM Employees";

        using SqlCommand command = new SqlCommand(query, connection);

        connection.Open();

        using SqlDataReader reader = command.ExecuteReader();

        while (reader.Read())
        {
            employees.Add(MapEmployee(reader));
        }

        return employees;
    }


    // =====================================================
    // GET EMPLOYEE BY ID
    // =====================================================

    public Employee? GetEmployeeById(int id)
    {
        using SqlConnection connection = CreateConnection();

        string query = @"
            SELECT
                EmployeeId,
                FullName,
                Email,
                Role,
                Department,
                Phone,
                Salary,
                DateOfJoining,
                ShiftStartTime,
                ShiftEndTime,
                CreatedAt
            FROM Employees
            WHERE EmployeeId = @EmployeeId";

        using SqlCommand command = new SqlCommand(query, connection);

        command.Parameters.AddWithValue("@EmployeeId", id);

        connection.Open();

        using SqlDataReader reader = command.ExecuteReader();

        if (reader.Read())
        {
            return MapEmployee(reader);
        }

        return null;
    }


    // =====================================================
    // GET EMPLOYEE BY EMAIL
    // =====================================================

    public EmployeeDto? GetEmployeeByEmail(string email)
    {
        using SqlConnection connection = CreateConnection();

        connection.Open();

        string query = @"
            SELECT
                EmployeeId,
                FullName,
                Email,
                Role,
                Department,
                Phone,
                Salary,
                DateOfJoining,
                ShiftStartTime,
                ShiftEndTime,
                CreatedAt
            FROM Employees
            WHERE Email = @Email";

        using SqlCommand command = new SqlCommand(query, connection);

        command.Parameters.AddWithValue("@Email", email);

        using SqlDataReader reader = command.ExecuteReader();

        if (!reader.Read())
        {
            return null;
        }

        return new EmployeeDto
        {
            EmployeeId = Convert.ToInt32(reader["EmployeeId"]),
            FullName = reader["FullName"].ToString() ?? string.Empty,
            Email = reader["Email"].ToString() ?? string.Empty,
            Role = reader["Role"].ToString() ?? "Employee",
            Department = reader["Department"].ToString() ?? string.Empty,
            Phone = reader["Phone"].ToString() ?? string.Empty,
            Salary = Convert.ToDecimal(reader["Salary"]),
            DateOfJoining = Convert.ToDateTime(reader["DateOfJoining"]),
            ShiftStartTime = (TimeSpan)reader["ShiftStartTime"],
            ShiftEndTime = (TimeSpan)reader["ShiftEndTime"],
            CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
        };
    }


    // =====================================================
    // ADD EMPLOYEE
    // =====================================================

    public void AddEmployee(EmployeeCreateDto employee)
    {
        using SqlConnection connection = CreateConnection();

        connection.Open();

        // -------------------------------------------------
        // Check whether email already exists
        // -------------------------------------------------

        string checkQuery = @"
        SELECT COUNT(*)
        FROM Employees
        WHERE Email = @Email";

        using SqlCommand checkCommand =
            new SqlCommand(checkQuery, connection);

        checkCommand.Parameters.AddWithValue(
            "@Email",
            employee.Email);

        int existingEmployee =
            Convert.ToInt32(
                checkCommand.ExecuteScalar());

        if (existingEmployee > 0)
        {
            throw new InvalidOperationException(
                "An employee with this email already exists.");
        }


        // -------------------------------------------------
        // Hash password
        // -------------------------------------------------

        string hashedPassword =
            BCrypt.Net.BCrypt.HashPassword(
                employee.Password);


        // -------------------------------------------------
        // Insert employee
        // -------------------------------------------------

        string query = @"
        INSERT INTO Employees
        (
            FullName,
            Email,
            PasswordHash,
            Role,
            Department,
            Phone,
            Salary,
            DateOfJoining
        )
        VALUES
        (
            @FullName,
            @Email,
            @PasswordHash,
            'Employee',
            @Department,
            @Phone,
            @Salary,
            @DateOfJoining
        )";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@FullName",
            employee.FullName);

        command.Parameters.AddWithValue(
            "@Email",
            employee.Email);

        command.Parameters.AddWithValue(
            "@PasswordHash",
            hashedPassword);

        command.Parameters.AddWithValue(
            "@Department",
            employee.Department);

        command.Parameters.AddWithValue(
            "@Phone",
            employee.Phone);

        command.Parameters.AddWithValue(
            "@Salary",
            employee.Salary);

        command.Parameters.AddWithValue(
            "@DateOfJoining",
            employee.DateOfJoining);


        command.ExecuteNonQuery();
    }


    // =====================================================
    // UPDATE EMPLOYEE
    // =====================================================

    public bool UpdateEmployee(
        int id,
        EmployeeUpdateDto employee)
    {
        using SqlConnection connection = CreateConnection();

        string query = @"
            UPDATE Employees
            SET
                FullName = @FullName,
                Email = @Email,
                Department = @Department,
                Phone = @Phone,
                Salary = @Salary,
                DateOfJoining = @DateOfJoining
            WHERE EmployeeId = @EmployeeId";

        using SqlCommand command = new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@EmployeeId",
            id
        );

        command.Parameters.AddWithValue(
            "@FullName",
            employee.FullName
        );

        command.Parameters.AddWithValue(
            "@Email",
            employee.Email
        );

        command.Parameters.AddWithValue(
            "@Department",
            employee.Department
        );

        command.Parameters.AddWithValue(
            "@Phone",
            employee.Phone
        );

        command.Parameters.AddWithValue(
            "@Salary",
            employee.Salary
        );

        command.Parameters.AddWithValue(
            "@DateOfJoining",
            employee.DateOfJoining
        );

        connection.Open();

        int rowsAffected = command.ExecuteNonQuery();

        return rowsAffected > 0;
    }


    // =====================================================
    // DELETE EMPLOYEE
    // =====================================================

    public bool DeleteEmployee(int id)
    {
        using SqlConnection connection = CreateConnection();

        string query = @"
            DELETE FROM Employees
            WHERE EmployeeId = @EmployeeId";

        using SqlCommand command = new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@EmployeeId",
            id
        );

        connection.Open();

        int rowsAffected = command.ExecuteNonQuery();

        return rowsAffected > 0;
    }
}
