import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  clockIn,
  clockOut,
  getMyTodayAttendance,
} from "../../services/attendanceService";

function formatTime(time) {
  if (!time) return "—";
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function AttendanceClockCard() {
  const [now, setNow] = useState(new Date());
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadToday() {
      try {
        setToday(await getMyTodayAttendance());
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load today's attendance.");
      } finally {
        setLoading(false);
      }
    }

    loadToday();
  }, []);

  async function handleAction(action, successMessage) {
    try {
      setSubmitting(true);
      setToday(await action());
      toast.success(successMessage);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update attendance.");
    } finally {
      setSubmitting(false);
    }
  }

  const attendance = today?.attendance;
  const hasClockedIn = Boolean(attendance?.checkInTime);
  const hasClockedOut = Boolean(attendance?.checkOutTime);
  const shift = today
    ? `${formatTime(today.shiftStartTime)} – ${formatTime(today.shiftEndTime)}`
    : "09:30 AM – 07:00 PM";

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-700 p-6 text-white shadow-lg sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-sky-100">{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
          <p className="mt-4 text-sm text-sky-100">Assigned shift: <span className="font-semibold text-white">{shift}</span></p>
          <p className="mt-1 text-sm text-sky-100">9:00+ hrs: Present · 4:00–8:59 hrs: Half Day · Under 4:00 hrs: Absent.</p>
        </div>

        <div className="rounded-xl bg-white/15 p-5 backdrop-blur-sm lg:min-w-72">
          {loading ? (
            <p className="text-sm text-sky-100">Loading attendance status...</p>
          ) : hasClockedOut ? (
            <>
              <p className="text-sm text-sky-100">Today&apos;s attendance</p>
              <p className="mt-1 text-xl font-bold">{attendance.status}</p>
              <p className="mt-3 text-sm text-sky-100">In: {formatTime(attendance.checkInTime)} · Out: {formatTime(attendance.checkOutTime)}</p>
            </>
          ) : hasClockedIn ? (
            <>
              <p className="text-sm text-sky-100">Signed in at {formatTime(attendance.checkInTime)}</p>
              <button type="button" disabled={submitting} onClick={() => handleAction(clockOut, "Signed out successfully.")} className="mt-4 w-full rounded-lg bg-orange-400 px-5 py-3 font-semibold text-slate-900 transition hover:bg-orange-300 disabled:opacity-50">
                {submitting ? "Signing out..." : "Sign Out"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-sky-100">Ready to begin your shift?</p>
              <button type="button" disabled={submitting} onClick={() => handleAction(clockIn, "Signed in successfully.")} className="mt-4 w-full rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:opacity-50">
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default AttendanceClockCard;
