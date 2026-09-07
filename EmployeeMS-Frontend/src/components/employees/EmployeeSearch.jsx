function EmployeeSearch({
  searchTerm,
  setSearchTerm,
  department,
  setDepartment,
  departments,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow md:flex-row md:items-center md:justify-between">

      <input
        type="text"
        placeholder="🔍 Search employee..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500 md:w-96"
      />

      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
      >
        <option value="">All Departments</option>

        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>

    </div>
  );
}

export default EmployeeSearch;