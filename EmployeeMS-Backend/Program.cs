using EmployeeAPI.Repositories;
using EmployeeAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var jwtSettings = builder.Configuration.GetSection("Jwt");

// =====================================================
// SERVICES
// =====================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

builder.Services.AddScoped<
    IEmployeeRepository,
    EmployeeRepository>();

builder.Services.AddScoped<
    IAdminAuthRepository,
    AdminAuthRepository
>();

builder.Services.AddScoped<
    IAuthRepository,
    AuthRepository>();

builder.Services.AddScoped<
    IAttendanceRepository,
    AttendanceRepository
>();

builder.Services.AddScoped<
    IAttendanceReportRepository,
    AttendanceReportRepository
>();

builder.Services.AddScoped<IHolidayRepository, HolidayRepository>();
builder.Services.AddScoped<ILeaveRepository, LeaveRepository>();

builder.Services.AddHostedService<AttendanceAutoMarkService>();


// =====================================================
// SWAGGER
// =====================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new Microsoft.OpenApi.OpenApiSecurityScheme
        {
            In = Microsoft.OpenApi.ParameterLocation.Header,
            Description = "Enter JWT Token",
            Name = "Authorization",
            Type = Microsoft.OpenApi.SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT"
        });

    options.AddSecurityRequirement(document => new()
    {
        [
            new Microsoft.OpenApi.OpenApiSecuritySchemeReference(
                "Bearer",
                document)
        ] = []
    });
});


// =====================================================
// JWT AUTHENTICATION
// =====================================================

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    jwtSettings["Issuer"],

                ValidAudience =
                    jwtSettings["Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtSettings["Key"]!
                        )
                    ),

                ClockSkew = TimeSpan.Zero
            };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine(
                    $"JWT FAILED: {context.Exception}");

                return Task.CompletedTask;
            },

            OnTokenValidated = context =>
            {
                Console.WriteLine("JWT VALIDATED");

                return Task.CompletedTask;
            },

            OnChallenge = context =>
            {
                Console.WriteLine("JWT CHALLENGE");

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();


// =====================================================
// BUILD APPLICATION
// =====================================================

var app = builder.Build();


// =====================================================
// MIDDLEWARE
// =====================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("ReactPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();


// =====================================================
// ATTENDANCE SCHEMA UPDATES
// =====================================================

static async Task EnsureAttendanceSchemaAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var connectionString = configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("DefaultConnection is not configured.");

    const string query = @"
        IF COL_LENGTH('dbo.Employees', 'ShiftStartTime') IS NULL
        BEGIN
            ALTER TABLE dbo.Employees ADD ShiftStartTime time NOT NULL
                CONSTRAINT DF_Employees_ShiftStartTime DEFAULT ('09:30:00');
        END

        IF COL_LENGTH('dbo.Employees', 'ShiftEndTime') IS NULL
        BEGIN
            ALTER TABLE dbo.Employees ADD ShiftEndTime time NOT NULL
                CONSTRAINT DF_Employees_ShiftEndTime DEFAULT ('19:00:00');
        END";

    using var connection = new SqlConnection(connectionString);
    using var command = new SqlCommand(query, connection);
    await connection.OpenAsync();
    await command.ExecuteNonQueryAsync();

    const string holidayQuery = @"
        IF OBJECT_ID('dbo.Holidays', 'U') IS NULL
        BEGIN
            CREATE TABLE dbo.Holidays
            (
                HolidayId int IDENTITY(1,1) PRIMARY KEY,
                HolidayDate date NOT NULL UNIQUE,
                Name nvarchar(100) NOT NULL,
                CreatedAt datetime2 NOT NULL DEFAULT GETDATE()
            );
        END";
    using var holidayCommand = new SqlCommand(holidayQuery, connection);
    await holidayCommand.ExecuteNonQueryAsync();

    const string leaveQuery = @"
        IF OBJECT_ID('dbo.LeaveRequests', 'U') IS NULL
        BEGIN
            CREATE TABLE dbo.LeaveRequests
            (
                LeaveId int IDENTITY(1,1) PRIMARY KEY,
                EmployeeId int NOT NULL,
                StartDate date NOT NULL,
                EndDate date NOT NULL,
                LeaveType nvarchar(50) NOT NULL,
                Reason nvarchar(500) NOT NULL,
                Status nvarchar(20) NOT NULL DEFAULT 'Pending',
                ReviewedAt datetime2 NULL,
                CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT FK_LeaveRequests_Employees
                    FOREIGN KEY (EmployeeId) REFERENCES dbo.Employees(EmployeeId),
                CONSTRAINT CK_LeaveRequests_Dates CHECK (EndDate >= StartDate),
                CONSTRAINT CK_LeaveRequests_Status
                    CHECK (Status IN ('Pending', 'Approved', 'Rejected'))
            );

            CREATE INDEX IX_LeaveRequests_EmployeeDates
                ON dbo.LeaveRequests(EmployeeId, StartDate, EndDate);
        END";
    using var leaveCommand = new SqlCommand(leaveQuery, connection);
    await leaveCommand.ExecuteNonQueryAsync();
}


// =====================================================
// INITIAL ADMIN SEED
// =====================================================

static async Task SeedInitialAdminAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();

    var configuration =
        scope.ServiceProvider
            .GetRequiredService<IConfiguration>();

    var connectionString =
        configuration
            .GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException(
            "DefaultConnection is not configured."
        );

    var adminSection =
        configuration.GetSection("InitialAdmin");

    string fullName =
        adminSection["FullName"]!;

    string email =
        adminSection["Email"]!;

    string password =
        adminSection["Password"]!;

    string role =
        adminSection["Role"]!;


    using var connection =
        new SqlConnection(connectionString);

    await connection.OpenAsync();


    // -------------------------------------------------
    // Check if admin already exists
    // -------------------------------------------------

    string checkQuery = @"
        SELECT COUNT(*)
        FROM Employees
        WHERE Email = @Email";

    using var checkCommand =
        new SqlCommand(
            checkQuery,
            connection);

    checkCommand.Parameters.AddWithValue(
        "@Email",
        email);

    int count =
        Convert.ToInt32(
            await checkCommand
                .ExecuteScalarAsync());

    if (count > 0)
    {
        Console.WriteLine(
            "Initial admin already exists.");

        return;
    }


    // -------------------------------------------------
    // Hash admin password
    // -------------------------------------------------

    string hashedPassword =
        BCrypt.Net.BCrypt.HashPassword(
            password);


    // -------------------------------------------------
    // Insert admin into Employees
    // -------------------------------------------------

    string insertQuery = @"
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
            @Role,
            @Department,
            @Phone,
            @Salary,
            @DateOfJoining
        )";

    using var insertCommand =
        new SqlCommand(
            insertQuery,
            connection);

    insertCommand.Parameters.AddWithValue(
        "@FullName",
        fullName);

    insertCommand.Parameters.AddWithValue(
        "@Email",
        email);

    insertCommand.Parameters.AddWithValue(
        "@PasswordHash",
        hashedPassword);

    insertCommand.Parameters.AddWithValue(
        "@Role",
        role);

    // Required employee fields
    insertCommand.Parameters.AddWithValue(
        "@Department",
        "Administration");

    insertCommand.Parameters.AddWithValue(
        "@Phone",
        "0000000000");

    insertCommand.Parameters.AddWithValue(
        "@Salary",
        0);

    insertCommand.Parameters.AddWithValue(
        "@DateOfJoining",
        DateTime.Now);


    await insertCommand.ExecuteNonQueryAsync();

    Console.WriteLine(
        "Initial admin created successfully.");
}

Console.WriteLine(
    BCrypt.Net.BCrypt.HashPassword("Admin@123cd cd")
);


// =====================================================
// RUN INITIAL ADMIN SEED
// =====================================================

await EnsureAttendanceSchemaAsync(app);
await SeedInitialAdminAsync(app);

app.Run();
