using EmployeeAPI.Repositories;

namespace EmployeeAPI.Services;

public class AttendanceAutoMarkService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AttendanceAutoMarkService> _logger;

    public AttendanceAutoMarkService(
        IServiceScopeFactory scopeFactory,
        ILogger<AttendanceAutoMarkService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await MarkMissedDaysAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            DateTime nextRun = DateTime.Today.AddDays(1).AddMinutes(1);
            TimeSpan delay = nextRun - DateTime.Now;
            await Task.Delay(delay, stoppingToken);
            await MarkMissedDaysAsync(stoppingToken);
        }
    }

    private Task MarkMissedDaysAsync(CancellationToken cancellationToken)
    {
        DateTime yesterday = DateTime.Today.AddDays(-1);

        try
        {
            using IServiceScope scope = _scopeFactory.CreateScope();
            var repository = scope.ServiceProvider
                .GetRequiredService<IAttendanceRepository>();

            // The repository ignores days that already have any attendance record.
            repository.MarkMissingAttendanceAsAbsent(yesterday);
        }
        catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogError(ex, "Unable to automatically mark missing attendance.");
        }

        return Task.CompletedTask;
    }
}
