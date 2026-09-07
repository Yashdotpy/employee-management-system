using EmployeeAPI.DTOs;
using Microsoft.Data.SqlClient;

namespace EmployeeAPI.Repositories;

public class AttendanceReportRepository
    : IAttendanceReportRepository
{
    private readonly string _connectionString;

    public AttendanceReportRepository(
        IConfiguration configuration)
    {
        _connectionString =
            configuration.GetConnectionString(
                "DefaultConnection"
            )
            ?? throw new InvalidOperationException(
                "DefaultConnection is not configured."
            );
    }

    public AttendanceTodayReportDto GetTodayReport()
    {
        using SqlConnection connection =
            new SqlConnection(_connectionString);

        connection.Open();

        DateTime today = DateTime.UtcNow.Date;

        // =====================================================
        // TOTAL EMPLOYEES
        // =====================================================

        int totalEmployees = 0;

        string employeeQuery = @"
            SELECT COUNT(*)
            FROM Employees";

        using (
            SqlCommand command =
                new SqlCommand(
                    employeeQuery,
                    connection
                )
        )
        {
            totalEmployees =
                Convert.ToInt32(
                    command.ExecuteScalar()
                );
        }

        // =====================================================
        // ATTENDANCE COUNTS
        // =====================================================

        int present = 0;
        int absent = 0;
        int halfDay = 0;
        int leave = 0;

        string attendanceQuery = @"
            SELECT
                Status,
                COUNT(*) AS Total
            FROM Attendance
            WHERE AttendanceDate = @AttendanceDate
            GROUP BY Status";

        using (
            SqlCommand command =
                new SqlCommand(
                    attendanceQuery,
                    connection
                )
        )
        {
            command.Parameters.AddWithValue(
                "@AttendanceDate",
                today
            );

            using SqlDataReader reader =
                command.ExecuteReader();

            while (reader.Read())
            {
                string status =
                    reader["Status"]?.ToString()
                    ?? string.Empty;

                int count =
                    Convert.ToInt32(
                        reader["Total"]
                    );

                switch (status)
                {
                    case "Present":
                        present = count;
                        break;

                    case "Absent":
                        absent = count;
                        break;

                    case "Half Day":
                        halfDay = count;
                        break;

                    case "Leave":
                        leave = count;
                        break;
                }
            }
        }

        return new AttendanceTodayReportDto
        {
            Date = today,
            TotalEmployees = totalEmployees,
            Present = present,
            Absent = absent,
            HalfDay = halfDay,
            Leave = leave
        };
    }

    public List<EmployeeAttendanceSummaryDto>
    GetEmployeeAttendanceSummary(
        int year,
        int month)
    {
        using SqlConnection connection =
            new SqlConnection(_connectionString);

        connection.Open();

        string query = @"
        SELECT
            e.EmployeeId,
            e.FullName,

            ISNULL(
                SUM(
                    CASE
                        WHEN a.Status = 'Present'
                        THEN 1
                        ELSE 0
                    END
                ),
                0
            ) AS Present,

            ISNULL(
                SUM(
                    CASE
                        WHEN a.Status = 'Absent'
                        THEN 1
                        ELSE 0
                    END
                ),
                0
            ) AS Absent,

            ISNULL(
                SUM(
                    CASE
                        WHEN a.Status = 'Half Day'
                        THEN 1
                        ELSE 0
                    END
                ),
                0
            ) AS HalfDay,

            ISNULL(
                SUM(
                    CASE
                        WHEN a.Status = 'Leave'
                        THEN 1
                        ELSE 0
                    END
                ),
                0
            ) AS Leave,

            COUNT(a.AttendanceId) AS TotalDays

        FROM Employees e

        LEFT JOIN Attendance a
            ON e.EmployeeId = a.EmployeeId
            AND YEAR(a.AttendanceDate) = @Year
            AND MONTH(a.AttendanceDate) = @Month

        GROUP BY
            e.EmployeeId,
            e.FullName

        ORDER BY
            e.FullName;
    ";

        List<EmployeeAttendanceSummaryDto> result = new();

        using SqlCommand command =
            new SqlCommand(query, connection);

        command.Parameters.AddWithValue(
            "@Year",
            year
        );

        command.Parameters.AddWithValue(
            "@Month",
            month
        );

        using SqlDataReader reader =
            command.ExecuteReader();

        while (reader.Read())
        {
            int present =
                Convert.ToInt32(reader["Present"]);

            int absent =
                Convert.ToInt32(reader["Absent"]);

            int halfDay =
                Convert.ToInt32(reader["HalfDay"]);

            int leave =
                Convert.ToInt32(reader["Leave"]);

            int totalDays =
                Convert.ToInt32(reader["TotalDays"]);

            decimal attendancePercentage = 0;

            if (totalDays > 0)
            {
                attendancePercentage =
                    (
                        present +
                        (halfDay * 0.5m)
                    )
                    / totalDays
                    * 100;
            }

            result.Add(
                new EmployeeAttendanceSummaryDto
                {
                    EmployeeId =
                        Convert.ToInt32(
                            reader["EmployeeId"]
                        ),

                    EmployeeName =
                        reader["FullName"]?.ToString()
                        ?? string.Empty,

                    Present = present,

                    Absent = absent,

                    HalfDay = halfDay,

                    Leave = leave,

                    TotalDays = totalDays,

                    AttendancePercentage =
                        Math.Round(
                            attendancePercentage,
                            2
                        )
                }
            );
        }

        return result;
    }
}