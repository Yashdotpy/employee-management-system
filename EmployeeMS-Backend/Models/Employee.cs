namespace EmployeeAPI.Models
{
    public class Employee
    {
        public int EmployeeId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "Employee";

        public string Department { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public decimal Salary { get; set; }

        public DateTime DateOfJoining { get; set; }

        public TimeSpan ShiftStartTime { get; set; } = new(9, 30, 0);

        public TimeSpan ShiftEndTime { get; set; } = new(19, 0, 0);

        public DateTime CreatedAt { get; set; }
    }
}
