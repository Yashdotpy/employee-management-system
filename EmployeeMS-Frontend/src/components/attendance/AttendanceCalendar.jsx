import { useMemo, useState } from "react";

const statusConfig = {
  Present: { code: "P", className: "bg-emerald-50 text-emerald-700" },
  Absent: { code: "A", className: "bg-red-50 text-red-600" },
  "Half Day": { code: "H", className: "bg-amber-50 text-amber-700" },
  Leave: { code: "L", className: "bg-violet-50 text-violet-700" },
  "In Progress": { code: "I", className: "bg-sky-50 text-sky-700" },
  "Off Day": { code: "O", className: "bg-slate-100 text-slate-700" },
  Holiday: { code: "H", className: "bg-fuchsia-50 text-fuchsia-700" },
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function recordDateKey(record) {
  return record.attendanceDate?.split("T")[0];
}

function formatTime(time) {
  if (!time) return "—";

  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function workMinutes(record) {
  if (!record?.checkInTime || !record?.checkOutTime) return 0;

  const [inHours, inMinutes] = record.checkInTime.split(":").map(Number);
  const [outHours, outMinutes] = record.checkOutTime.split(":").map(Number);
  return Math.max(0, outHours * 60 + outMinutes - (inHours * 60 + inMinutes));
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}

function AttendanceCalendar({ records, holidays = [], leaves = [], employeeName, readOnly = true }) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const recordsByDate = useMemo(
    () => new Map(records.map((record) => [recordDateKey(record), record])),
    [records]
  );
  const holidaysByDate = useMemo(
    () => new Map(holidays.map((holiday) => [holiday.holidayDate?.split("T")[0], holiday])),
    [holidays]
  );

  const monthRecords = useMemo(
    () => records.filter((record) => {
      const date = new Date(`${recordDateKey(record)}T00:00:00`);
      return date.getFullYear() === visibleMonth.getFullYear() &&
        date.getMonth() === visibleMonth.getMonth();
    }),
    [records, visibleMonth]
  );

  const calendarDays = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [visibleMonth]);

  const selectedRecord = recordsByDate.get(selectedDate);
  const selectedHoliday = holidaysByDate.get(selectedDate);
  const selectedLeave = leaves.find((leave) =>
    leave.status === "Approved" &&
    selectedDate >= leave.startDate?.split("T")[0] &&
    selectedDate <= leave.endDate?.split("T")[0]
  );
  const selectedDay = new Date(`${selectedDate}T00:00:00`);
  const selectedIsWeekend = selectedDay.getDay() === 0 || selectedDay.getDay() === 6;
  const detailRecord = selectedHoliday
    ? { status: "Holiday", remarks: selectedHoliday.name }
    : selectedIsWeekend
    ? { status: "Off Day" }
    : selectedLeave
    ? { status: "Leave", remarks: selectedLeave.leaveType }
    : selectedRecord;
  const presentDays = monthRecords.filter((record) => record.status === "Present").length;
  const exceptionDays = monthRecords.filter(
    (record) => record.status !== "Present" && record.status !== "Off Day"
  ).length;
  const totalWorkMinutes = monthRecords.reduce(
    (total, record) => total + workMinutes(record),
    0
  );
  const averageWorkMinutes = monthRecords.length
    ? Math.round(totalWorkMinutes / monthRecords.length)
    : 0;
  const selectedDateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "long", year: "numeric" }
  );

  function moveMonth(offset) {
    setVisibleMonth((current) =>
      new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Avg. work hrs" value={formatDuration(averageWorkMinutes)} />
        <SummaryCard label="Total work hrs" value={formatDuration(totalWorkMinutes)} />
        <SummaryCard label="Present days" value={presentDays} valueClass="text-emerald-600" />
        <SummaryCard label="Exception days" value={exceptionDays} valueClass="text-red-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <button type="button" onClick={() => moveMonth(-1)} className="text-sm font-medium text-slate-500 hover:text-slate-900">← Prev</button>
            <h2 className="text-xl font-bold text-slate-700">
              {visibleMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </h2>
            <button type="button" onClick={() => moveMonth(1)} className="text-sm font-medium text-slate-500 hover:text-slate-900">Next →</button>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {weekdays.map((day) => <div key={day} className="px-2 py-3 text-center text-sm font-semibold text-slate-500">{day}</div>)}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dateKey = toDateKey(day);
              const record = recordsByDate.get(dateKey);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const holiday = holidaysByDate.get(dateKey);
              const approvedLeave = leaves.find((leave) =>
                leave.status === "Approved" &&
                dateKey >= leave.startDate?.split("T")[0] &&
                dateKey <= leave.endDate?.split("T")[0]
              );
              const displayStatus = holiday
                ? "Holiday"
                : isWeekend
                ? "Off Day"
                : approvedLeave
                ? "Leave"
                : record?.status;
              const config = statusConfig[displayStatus];
              const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
              const isSelected = selectedDate === dateKey;

              return (
                <button
                  type="button"
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`min-h-24 border-b border-r border-slate-200 p-3 text-left transition hover:bg-slate-50 ${!isCurrentMonth ? "bg-slate-50 text-slate-400" : "bg-white"} ${isSelected ? "ring-2 ring-inset ring-sky-500" : ""}`}
                >
                  <span className="text-base font-medium">{day.getDate()}</span>
                  {displayStatus && (
                    <span className={`mt-3 flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold ${config?.className || "bg-slate-100 text-slate-700"}`}>
                      {config?.code || "?"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm font-medium text-slate-500">Attendance details</p>
            <h2 className="mt-1 text-xl font-bold text-slate-800">{selectedDateLabel}</h2>
            {employeeName && <p className="mt-1 text-sm text-slate-500">{employeeName}</p>}
          </div>

          {detailRecord ? (
            <div className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusConfig[detailRecord.status]?.className || "bg-slate-100 text-slate-700"}`}>{detailRecord.status}</span>
              </div>
              <DetailRow label="First in" value={formatTime(detailRecord.checkInTime)} />
              <DetailRow label="Last out" value={formatTime(detailRecord.checkOutTime)} />
              <DetailRow label="Total work hrs" value={formatDuration(workMinutes(detailRecord))} />
              <DetailRow label="Remarks" value={detailRecord.remarks || (detailRecord.status === "Off Day" ? "Weekend off day." : "—")} />
              {!readOnly && <p className="text-xs text-slate-400">Use the attendance management list to edit this record.</p>}
            </div>
          ) : (
            <div className="p-6 text-sm text-slate-500">No attendance record has been added for this date.</div>
          )}
        </aside>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Legend</h2>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${config.className}`}>{config.code}</span>
              {status}
            </div>
          ))}
          <div className="flex items-center gap-2"><span className="h-7 w-7 rounded border border-slate-200 bg-slate-50" />No record</div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, valueClass = "text-slate-800" }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-3 text-2xl font-bold ${valueClass}`}>{value}</p></div>;
}

function DetailRow({ label, value }) {
  return <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-4 text-sm"><span className="text-slate-500">{label}</span><span className="text-right font-semibold text-slate-700">{value}</span></div>;
}

export default AttendanceCalendar;
