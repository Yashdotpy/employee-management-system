using EmployeeAPI.DTOs;
using EmployeeAPI.Models;
using Microsoft.Data.SqlClient;

namespace EmployeeAPI.Repositories;

public class AttendanceRepository : IAttendanceRepository
{
    private static readonly HashSet<string> ValidStatuses =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "Present",
            "Absent",
            "Half Day",
            "Leave"
        };

    private readonly string _connectionString;

    public AttendanceRepository(IConfiguration configuration)
    {
        _connectionString =
            configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "DefaultConnection is not configured."
            );
    }


    // =====================================================
    // GET ALL ATTENDANCE
    // =====================================================

    public List<Attendance> GetAllAttendance()
    {
        var attendanceList = new List<Attendance>();

        using SqlConnection connection =
            new SqlConnection(_connectionString);

        string query = @"
            SELECT
                AttendanceId,
                EmployeeId,
                AttendanceDate,
                CheckInTime,
                CheckOutTime,
                Status,
                Remarks,
                CreatedAt
            FROM Attendance
            ORDER BY AttendanceDate DESC";

        using SqlCommand command =
            new SqlCommand(query, connection);

        connection.Open();

        using SqlDataReader reader =
            command.ExecuteReader();

        while (reader.Read())
        {
            attendanceList.Add(new Attendance
            {
                AttendanceId =
                    Convert.ToInt32(
                        reader["AttendanceId"]
                    ),

                EmployeeId =
                    Convert.ToInt32(
                        reader["EmployeeId"]
                    ),

                AttendanceDate =
                    Convert.ToDateTime(
                        reader["AttendanceDate"]
                    ),

                CheckInTime =
                    reader["CheckInTime"] == DBNull.Value
                        ? null
                        : (TimeSpan?)
                          reader["CheckInTime"],

                CheckOutTime =
                    reader["CheckOutTime"] == DBNull.Value
                        ? null
                        : (TimeSpan?)
                          reader["CheckOutTime"],

                Status =
                    reader["Status"]?.ToString()
                    ?? string.Empty,

                Remarks =
                    reader["Remarks"] == DBNull.Value
                        ? null
                        : reader["Remarks"]?.ToString(),

                CreatedAt =
                    Convert.ToDateTime(
                        reader["CreatedAt"]
                    )
            });
        }

        return attendanceList;
    }


    // =====================================================
    // GET ATTENDANCE BY ID
    // =====================================================

    public Attendance? GetAttendanceById(int id)
    {
        using SqlConnection connection =
            new SqlConnection(_connectionString);

        string query = @"
            SELECT
                AttendanceId,
                EmployeeId,
                AttendanceDate,
                CheckInTime,
                CheckOutTime,
                Status,
                Remarks,
                CreatedAt
            FROM Attendance
            WHERE AttendanceId = @AttendanceId";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@AttendanceId",
            id
        );

        connection.Open();

        using SqlDataReader reader =
            command.ExecuteReader();

        if (!reader.Read())
        {
            return null;
        }

        return new Attendance
        {
            AttendanceId =
                Convert.ToInt32(
                    reader["AttendanceId"]
                ),

            EmployeeId =
                Convert.ToInt32(
                    reader["EmployeeId"]
                ),

            AttendanceDate =
                Convert.ToDateTime(
                    reader["AttendanceDate"]
                ),

            CheckInTime =
                reader["CheckInTime"] == DBNull.Value
                    ? null
                    : (TimeSpan?)
                      reader["CheckInTime"],

            CheckOutTime =
                reader["CheckOutTime"] == DBNull.Value
                    ? null
                    : (TimeSpan?)
                      reader["CheckOutTime"],

            Status =
                reader["Status"]?.ToString()
                ?? string.Empty,

            Remarks =
                reader["Remarks"] == DBNull.Value
                    ? null
                    : reader["Remarks"]?.ToString(),

            CreatedAt =
                Convert.ToDateTime(
                    reader["CreatedAt"]
                )
        };
    }


    // =====================================================
    // GET ATTENDANCE BY EMPLOYEE
    // =====================================================

    public List<Attendance> GetAttendanceByEmployee(
        int employeeId)
    {
        var attendanceList = new List<Attendance>();

        using SqlConnection connection =
            new SqlConnection(_connectionString);

        string query = @"
            SELECT
                AttendanceId,
                EmployeeId,
                AttendanceDate,
                CheckInTime,
                CheckOutTime,
                Status,
                Remarks,
                CreatedAt
            FROM Attendance
            WHERE EmployeeId = @EmployeeId
            ORDER BY AttendanceDate DESC";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@EmployeeId",
            employeeId
        );

        connection.Open();

        using SqlDataReader reader =
            command.ExecuteReader();

        while (reader.Read())
        {
            attendanceList.Add(new Attendance
            {
                AttendanceId =
                    Convert.ToInt32(
                        reader["AttendanceId"]
                    ),

                EmployeeId =
                    Convert.ToInt32(
                        reader["EmployeeId"]
                    ),

                AttendanceDate =
                    Convert.ToDateTime(
                        reader["AttendanceDate"]
                    ),

                CheckInTime =
                    reader["CheckInTime"] == DBNull.Value
                        ? null
                        : (TimeSpan?)
                          reader["CheckInTime"],

                CheckOutTime =
                    reader["CheckOutTime"] == DBNull.Value
                        ? null
                        : (TimeSpan?)
                          reader["CheckOutTime"],

                Status =
                    reader["Status"]?.ToString()
                    ?? string.Empty,

                Remarks =
                    reader["Remarks"] == DBNull.Value
                        ? null
                        : reader["Remarks"]?.ToString(),

                CreatedAt =
                    Convert.ToDateTime(
                        reader["CreatedAt"]
                    )
            });
        }

        return attendanceList;
    }

    public EmployeeAttendanceTodayDto? GetEmployeeTodayAttendance(
        int employeeId)
    {
        using SqlConnection connection = new SqlConnection(_connectionString);
        connection.Open();

        var shift = GetEmployeeShift(connection, employeeId);
        if (shift == null)
        {
            return null;
        }

        return new EmployeeAttendanceTodayDto
        {
            ShiftStartTime = shift.Value.Start,
            ShiftEndTime = shift.Value.End,
            Attendance = GetAttendanceForDate(connection, employeeId, DateTime.Today)
        };
    }

    public EmployeeAttendanceTodayDto ClockIn(int employeeId)
    {
        using SqlConnection connection = new SqlConnection(_connectionString);
        connection.Open();

        var shift = GetEmployeeShift(connection, employeeId)
            ?? throw new InvalidOperationException("Employee not found.");
        Attendance? attendance = GetAttendanceForDate(
            connection, employeeId, DateTime.Today);

        if (attendance?.CheckInTime.HasValue == true)
        {
            throw new InvalidOperationException("You have already signed in today.");
        }

        if (attendance == null)
        {
            const string insertQuery = @"
                INSERT INTO Attendance
                    (EmployeeId, AttendanceDate, CheckInTime, Status)
                VALUES
                    (@EmployeeId, @AttendanceDate, @CheckInTime, 'In Progress')";
            using var insertCommand = new SqlCommand(insertQuery, connection);
            insertCommand.Parameters.AddWithValue("@EmployeeId", employeeId);
            insertCommand.Parameters.AddWithValue("@AttendanceDate", DateTime.Today);
            insertCommand.Parameters.AddWithValue("@CheckInTime", DateTime.Now.TimeOfDay);
            insertCommand.ExecuteNonQuery();
        }
        else
        {
            const string updateQuery = @"
                UPDATE Attendance
                SET CheckInTime = @CheckInTime, Status = 'In Progress'
                WHERE AttendanceId = @AttendanceId";
            using var updateCommand = new SqlCommand(updateQuery, connection);
            updateCommand.Parameters.AddWithValue("@AttendanceId", attendance.AttendanceId);
            updateCommand.Parameters.AddWithValue("@CheckInTime", DateTime.Now.TimeOfDay);
            updateCommand.ExecuteNonQuery();
        }

        return new EmployeeAttendanceTodayDto
        {
            ShiftStartTime = shift.Start,
            ShiftEndTime = shift.End,
            Attendance = GetAttendanceForDate(connection, employeeId, DateTime.Today)
        };
    }

    public EmployeeAttendanceTodayDto ClockOut(int employeeId)
    {
        using SqlConnection connection = new SqlConnection(_connectionString);
        connection.Open();

        var shift = GetEmployeeShift(connection, employeeId)
            ?? throw new InvalidOperationException("Employee not found.");
        Attendance? attendance = GetAttendanceForDate(
            connection, employeeId, DateTime.Today);

        if (attendance?.CheckInTime == null)
        {
            throw new InvalidOperationException("Sign in before signing out.");
        }

        if (attendance.CheckOutTime.HasValue)
        {
            throw new InvalidOperationException("You have already signed out today.");
        }

        TimeSpan checkOutTime = DateTime.Now.TimeOfDay;
        double workedMinutes = (checkOutTime - attendance.CheckInTime.Value).TotalMinutes;
        string status = workedMinutes >= 540
            ? "Present"
            : workedMinutes >= 240
                ? "Half Day"
                : "Absent";

        const string updateQuery = @"
            UPDATE Attendance
            SET CheckOutTime = @CheckOutTime, Status = @Status
            WHERE AttendanceId = @AttendanceId";
        using var updateCommand = new SqlCommand(updateQuery, connection);
        updateCommand.Parameters.AddWithValue("@AttendanceId", attendance.AttendanceId);
        updateCommand.Parameters.AddWithValue("@CheckOutTime", checkOutTime);
        updateCommand.Parameters.AddWithValue("@Status", status);
        updateCommand.ExecuteNonQuery();

        return new EmployeeAttendanceTodayDto
        {
            ShiftStartTime = shift.Start,
            ShiftEndTime = shift.End,
            Attendance = GetAttendanceForDate(connection, employeeId, DateTime.Today)
        };
    }

    public void MarkMissingAttendanceAsAbsent(DateTime throughDate)
    {
        using SqlConnection connection = new SqlConnection(_connectionString);
        connection.Open();

        const string query = @"
            WITH DateRange AS
            (
                SELECT CAST(MIN(DateOfJoining) AS date) AS AttendanceDate
                FROM Employees
                WHERE Role = 'Employee'

                UNION ALL

                SELECT DATEADD(day, 1, AttendanceDate)
                FROM DateRange
                WHERE AttendanceDate < @ThroughDate
            )
            INSERT INTO Attendance
                (EmployeeId, AttendanceDate, Status, Remarks)
            SELECT
                e.EmployeeId,
                d.AttendanceDate,
                'Absent',
                'Automatically marked absent because no sign-in was recorded.'
            FROM DateRange d
            INNER JOIN Employees e
                ON e.Role = 'Employee'
                AND CAST(e.DateOfJoining AS date) <= d.AttendanceDate
            WHERE e.Role = 'Employee'
              AND d.AttendanceDate IS NOT NULL
              AND NOT EXISTS
              (
                  SELECT 1
                  FROM Attendance a
                  WHERE a.EmployeeId = e.EmployeeId
                    AND a.AttendanceDate = d.AttendanceDate
              )
            OPTION (MAXRECURSION 0);";

        using SqlCommand command = new SqlCommand(query, connection);
        command.Parameters.Add("@ThroughDate", System.Data.SqlDbType.Date).Value = throughDate.Date;
        command.ExecuteNonQuery();
    }

    private static (TimeSpan Start, TimeSpan End)? GetEmployeeShift(
        SqlConnection connection,
        int employeeId)
    {
        const string query = @"
            SELECT ShiftStartTime, ShiftEndTime
            FROM Employees
            WHERE EmployeeId = @EmployeeId";
        using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@EmployeeId", employeeId);
        using SqlDataReader reader = command.ExecuteReader();

        return reader.Read()
            ? ((TimeSpan)reader["ShiftStartTime"], (TimeSpan)reader["ShiftEndTime"])
            : null;
    }

    private static Attendance? GetAttendanceForDate(
        SqlConnection connection,
        int employeeId,
        DateTime attendanceDate)
    {
        const string query = @"
            SELECT AttendanceId, EmployeeId, AttendanceDate, CheckInTime,
                   CheckOutTime, Status, Remarks, CreatedAt
            FROM Attendance
            WHERE EmployeeId = @EmployeeId AND AttendanceDate = @AttendanceDate";
        using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@EmployeeId", employeeId);
        command.Parameters.AddWithValue("@AttendanceDate", attendanceDate.Date);
        using SqlDataReader reader = command.ExecuteReader();

        if (!reader.Read())
        {
            return null;
        }

        return new Attendance
        {
            AttendanceId = Convert.ToInt32(reader["AttendanceId"]),
            EmployeeId = Convert.ToInt32(reader["EmployeeId"]),
            AttendanceDate = Convert.ToDateTime(reader["AttendanceDate"]),
            CheckInTime = reader["CheckInTime"] == DBNull.Value ? null : (TimeSpan?)reader["CheckInTime"],
            CheckOutTime = reader["CheckOutTime"] == DBNull.Value ? null : (TimeSpan?)reader["CheckOutTime"],
            Status = reader["Status"]?.ToString() ?? string.Empty,
            Remarks = reader["Remarks"] == DBNull.Value ? null : reader["Remarks"]?.ToString(),
            CreatedAt = Convert.ToDateTime(reader["CreatedAt"])
        };
    }


    // =====================================================
    // ADD ATTENDANCE
    // =====================================================

    public void AddAttendance(
        AttendanceCreateDto attendance)
    {
        using SqlConnection connection =
            new SqlConnection(_connectionString);

        connection.Open();
        ValidateAttendance(connection, attendance);

        string query = @"
            INSERT INTO Attendance
            (
                EmployeeId,
                AttendanceDate,
                CheckInTime,
                CheckOutTime,
                Status,
                Remarks
            )
            VALUES
            (
                @EmployeeId,
                @AttendanceDate,
                @CheckInTime,
                @CheckOutTime,
                @Status,
                @Remarks
            )";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@EmployeeId",
            attendance.EmployeeId
        );

        command.Parameters.AddWithValue(
            "@AttendanceDate",
            attendance.AttendanceDate.Date
        );

        command.Parameters.AddWithValue(
            "@CheckInTime",
            attendance.CheckInTime.HasValue
                ? attendance.CheckInTime.Value
                : DBNull.Value
        );

        command.Parameters.AddWithValue(
            "@CheckOutTime",
            attendance.CheckOutTime.HasValue
                ? attendance.CheckOutTime.Value
                : DBNull.Value
        );

        command.Parameters.AddWithValue(
            "@Status",
            attendance.Status
        );

        command.Parameters.AddWithValue(
            "@Remarks",
            attendance.Remarks ?? (object)DBNull.Value
        );

        command.ExecuteNonQuery();
    }


    // =====================================================
    // UPDATE ATTENDANCE
    // =====================================================

    public bool UpdateAttendance(
        int id,
        AttendanceCreateDto attendance)
    {
        using SqlConnection connection =
            new SqlConnection(_connectionString);

        connection.Open();
        ValidateAttendance(connection, attendance, id);

        string query = @"
            UPDATE Attendance
            SET
                EmployeeId = @EmployeeId,
                AttendanceDate = @AttendanceDate,
                CheckInTime = @CheckInTime,
                CheckOutTime = @CheckOutTime,
                Status = @Status,
                Remarks = @Remarks
            WHERE AttendanceId = @AttendanceId";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@AttendanceId",
            id
        );

        command.Parameters.AddWithValue(
            "@EmployeeId",
            attendance.EmployeeId
        );

        command.Parameters.AddWithValue(
            "@AttendanceDate",
            attendance.AttendanceDate.Date
        );

        command.Parameters.AddWithValue(
            "@CheckInTime",
            attendance.CheckInTime.HasValue
                ? attendance.CheckInTime.Value
                : DBNull.Value
        );

        command.Parameters.AddWithValue(
            "@CheckOutTime",
            attendance.CheckOutTime.HasValue
                ? attendance.CheckOutTime.Value
                : DBNull.Value
        );

        command.Parameters.AddWithValue(
            "@Status",
            attendance.Status
        );

        command.Parameters.AddWithValue(
            "@Remarks",
            attendance.Remarks ?? (object)DBNull.Value
        );

        int rowsAffected =
            command.ExecuteNonQuery();

        return rowsAffected > 0;
    }

    private static void ValidateAttendance(
        SqlConnection connection,
        AttendanceCreateDto attendance,
        int? attendanceIdToExclude = null)
    {
        if (attendance.EmployeeId <= 0)
        {
            throw new InvalidOperationException("A valid employee is required.");
        }

        if (!ValidStatuses.Contains(attendance.Status?.Trim() ?? string.Empty))
        {
            throw new InvalidOperationException(
                "Status must be Present, Absent, Half Day, or Leave.");
        }

        if (attendance.CheckInTime.HasValue &&
            attendance.CheckOutTime.HasValue &&
            attendance.CheckOutTime <= attendance.CheckInTime)
        {
            throw new InvalidOperationException(
                "Check-out time must be later than check-in time.");
        }

        const string employeeQuery = @"
            SELECT COUNT(*) FROM Employees WHERE EmployeeId = @EmployeeId";
        using (var employeeCommand = new SqlCommand(employeeQuery, connection))
        {
            employeeCommand.Parameters.AddWithValue("@EmployeeId", attendance.EmployeeId);
            if (Convert.ToInt32(employeeCommand.ExecuteScalar()) == 0)
            {
                throw new InvalidOperationException("Employee not found.");
            }
        }

        const string duplicateQuery = @"
            SELECT COUNT(*)
            FROM Attendance
            WHERE EmployeeId = @EmployeeId
              AND AttendanceDate = @AttendanceDate
              AND (@AttendanceId IS NULL OR AttendanceId <> @AttendanceId)";
        using var duplicateCommand = new SqlCommand(duplicateQuery, connection);
        duplicateCommand.Parameters.AddWithValue("@EmployeeId", attendance.EmployeeId);
        duplicateCommand.Parameters.AddWithValue("@AttendanceDate", attendance.AttendanceDate.Date);
        duplicateCommand.Parameters.AddWithValue(
            "@AttendanceId", attendanceIdToExclude ?? (object)DBNull.Value);

        if (Convert.ToInt32(duplicateCommand.ExecuteScalar()) > 0)
        {
            throw new InvalidOperationException(
                "Attendance has already been recorded for this employee and date.");
        }
    }


    // =====================================================
    // DELETE ATTENDANCE
    // =====================================================

    public bool DeleteAttendance(int id)
    {
        using SqlConnection connection =
            new SqlConnection(_connectionString);

        string query = @"
            DELETE FROM Attendance
            WHERE AttendanceId = @AttendanceId";

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@AttendanceId",
            id
        );

        connection.Open();

        int rowsAffected =
            command.ExecuteNonQuery();

        return rowsAffected > 0;
    }
}
