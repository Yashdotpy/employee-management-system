using EmployeeAPI.DTOs;
using EmployeeAPI.Models;
using Microsoft.Data.SqlClient;

namespace EmployeeAPI.Repositories;

public class LeaveRepository : ILeaveRepository
{
    private static readonly HashSet<string> ValidLeaveTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "Annual Leave", "Sick Leave", "Casual Leave", "Unpaid Leave"
        };

    private readonly string _connectionString;
    public LeaveRepository(IConfiguration configuration) => _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("DefaultConnection is not configured.");

    public List<LeaveRequest> GetAll() => Get("", null);
    public List<LeaveRequest> GetByEmployee(int employeeId) => Get("WHERE l.EmployeeId = @EmployeeId", employeeId);

    private List<LeaveRequest> Get(string whereClause, int? employeeId)
    {
        var leaves = new List<LeaveRequest>();
        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand($@"
            SELECT l.LeaveId, l.EmployeeId, e.FullName, l.StartDate, l.EndDate,
                   l.LeaveType, l.Reason, l.Status, l.CreatedAt
            FROM LeaveRequests l INNER JOIN Employees e ON e.EmployeeId = l.EmployeeId
            {whereClause} ORDER BY l.CreatedAt DESC", connection);
        if (employeeId.HasValue) command.Parameters.AddWithValue("@EmployeeId", employeeId.Value);
        connection.Open(); using var reader = command.ExecuteReader();
        while (reader.Read()) leaves.Add(new LeaveRequest { LeaveId = Convert.ToInt32(reader["LeaveId"]), EmployeeId = Convert.ToInt32(reader["EmployeeId"]), EmployeeName = reader["FullName"]?.ToString() ?? "", StartDate = Convert.ToDateTime(reader["StartDate"]), EndDate = Convert.ToDateTime(reader["EndDate"]), LeaveType = reader["LeaveType"]?.ToString() ?? "", Reason = reader["Reason"]?.ToString() ?? "", Status = reader["Status"]?.ToString() ?? "", CreatedAt = Convert.ToDateTime(reader["CreatedAt"]) });
        return leaves;
    }

    public void Create(int employeeId, LeaveCreateDto leave)
    {
        if (leave.EndDate.Date < leave.StartDate.Date) throw new InvalidOperationException("End date cannot be before start date.");
        if (leave.StartDate.Date < DateTime.Today) throw new InvalidOperationException("Leave cannot start in the past.");
        if (!ValidLeaveTypes.Contains(leave.LeaveType.Trim())) throw new InvalidOperationException("Invalid leave type.");
        if (string.IsNullOrWhiteSpace(leave.Reason)) throw new InvalidOperationException("Reason is required.");
        using var connection = new SqlConnection(_connectionString);
        connection.Open();

        using var duplicateCommand = new SqlCommand(@"
            SELECT COUNT(*) FROM LeaveRequests
            WHERE EmployeeId = @EmployeeId
              AND Status IN ('Pending', 'Approved')
              AND StartDate <= @EndDate AND EndDate >= @StartDate", connection);
        duplicateCommand.Parameters.AddWithValue("@EmployeeId", employeeId);
        duplicateCommand.Parameters.AddWithValue("@StartDate", leave.StartDate.Date);
        duplicateCommand.Parameters.AddWithValue("@EndDate", leave.EndDate.Date);
        if (Convert.ToInt32(duplicateCommand.ExecuteScalar()) > 0)
            throw new InvalidOperationException("A pending or approved leave already overlaps these dates.");

        using var command = new SqlCommand(@"INSERT INTO LeaveRequests (EmployeeId, StartDate, EndDate, LeaveType, Reason) VALUES (@EmployeeId, @StartDate, @EndDate, @LeaveType, @Reason)", connection);
        command.Parameters.AddWithValue("@EmployeeId", employeeId); command.Parameters.AddWithValue("@StartDate", leave.StartDate.Date); command.Parameters.AddWithValue("@EndDate", leave.EndDate.Date); command.Parameters.AddWithValue("@LeaveType", leave.LeaveType.Trim()); command.Parameters.AddWithValue("@Reason", leave.Reason.Trim());
        command.ExecuteNonQuery();
    }

    public bool UpdateStatus(int leaveId, string status)
    {
        if (status is not "Approved" and not "Rejected") throw new InvalidOperationException("Status must be Approved or Rejected.");
        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand(@"
            UPDATE LeaveRequests
            SET Status = @Status, ReviewedAt = GETDATE()
            WHERE LeaveId = @LeaveId AND Status = 'Pending';

            DECLARE @Updated int = @@ROWCOUNT;

            IF @Updated > 0 AND @Status = 'Approved'
            BEGIN
                UPDATE a
                SET a.Status = 'Leave', a.Remarks = CONCAT('Approved ', l.LeaveType)
                FROM Attendance a
                INNER JOIN LeaveRequests l ON l.LeaveId = @LeaveId
                WHERE a.EmployeeId = l.EmployeeId
                  AND a.AttendanceDate BETWEEN l.StartDate AND l.EndDate
                  AND a.Status = 'Absent'
                  AND a.Remarks = 'Automatically marked absent because no sign-in was recorded.';

                ;WITH LeaveDates AS
                (
                    SELECT StartDate AS LeaveDate, EndDate, EmployeeId, LeaveType
                    FROM LeaveRequests WHERE LeaveId = @LeaveId
                    UNION ALL
                    SELECT DATEADD(day, 1, LeaveDate), EndDate, EmployeeId, LeaveType
                    FROM LeaveDates WHERE LeaveDate < EndDate
                )
                INSERT INTO Attendance (EmployeeId, AttendanceDate, Status, Remarks)
                SELECT EmployeeId, LeaveDate, 'Leave', CONCAT('Approved ', LeaveType)
                FROM LeaveDates d
                WHERE d.LeaveDate <= CAST(GETDATE() AS date)
                  AND (DATEDIFF(day, '19000101', d.LeaveDate) % 7) NOT IN (5, 6)
                  AND NOT EXISTS (SELECT 1 FROM Holidays h WHERE h.HolidayDate = d.LeaveDate)
                  AND NOT EXISTS
                  (
                      SELECT 1 FROM Attendance a
                      WHERE a.EmployeeId = d.EmployeeId
                        AND a.AttendanceDate = d.LeaveDate
                  )
                OPTION (MAXRECURSION 0);
            END

            SELECT @Updated;", connection);
        command.Parameters.AddWithValue("@LeaveId", leaveId); command.Parameters.AddWithValue("@Status", status);
        connection.Open(); return Convert.ToInt32(command.ExecuteScalar()) > 0;
    }
}
