function EmployeeStats({ employees }) {
  const totalEmployees = employees.length;

  const totalDepartments = new Set(
    employees.map((e) => e.department)
  ).size;

  const averageSalary =
    employees.length > 0
      ? employees.reduce((sum, e) => sum + e.salary, 0) /
        employees.length
      : 0;

  const joinedThisMonth = employees.filter((e) => {
    const joiningDate = new Date(e.dateOfJoining);
    const today = new Date();

    return (
      joiningDate.getMonth() === today.getMonth() &&
      joiningDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const cards = [
    {
      title: "Employees",
      value: totalEmployees,
    },
    {
      title: "Departments",
      value: totalDepartments,
    },
    {
      title: "Avg Salary",
      value: `Rs.${averageSalary.toFixed(0)}`,
    },
    {
      title: "Joined This Month",
      value: joinedThisMonth,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl bg-white p-6 shadow"
        >
          <p className="text-sm text-slate-500">
            {card.title}
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}

export default EmployeeStats;