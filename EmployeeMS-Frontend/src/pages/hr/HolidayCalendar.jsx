import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import { createHoliday, deleteHoliday, getHolidays } from "../../services/holidayService";

function HolidayCalendar() {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadHolidays() {
    try { setHolidays(await getHolidays()); }
    catch { toast.error("Unable to load holidays."); }
  }

  useEffect(() => { loadHolidays(); }, []);

  async function addHoliday(event) {
    event.preventDefault();
    try {
      setSaving(true);
      await createHoliday({ holidayDate: date, name });
      setDate("");
      setName("");
      toast.success("Holiday added for all employees.");
      loadHolidays();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add holiday.");
    } finally { setSaving(false); }
  }

  async function removeHoliday(id) {
    if (!window.confirm("Remove this holiday?")) return;
    try {
      await deleteHoliday(id);
      toast.success("Holiday removed.");
      loadHolidays();
    } catch { toast.error("Unable to remove holiday."); }
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => navigate("/attendance")} className="mb-6 text-sm font-semibold text-sky-600">← Back to attendance</button>
        <div className="mb-8"><h1 className="text-3xl font-bold text-slate-800">Holiday Calendar</h1><p className="mt-2 text-slate-500">Add company holidays that are shown to every employee.</p></div>

        <form onSubmit={addHoliday} className="mb-6 grid gap-4 rounded-xl bg-white p-6 shadow sm:grid-cols-[1fr_1.5fr_auto]">
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="rounded-lg border border-slate-300 px-4 py-3" />
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} required maxLength="100" placeholder="Holiday name (e.g. Diwali)" className="rounded-lg border border-slate-300 px-4 py-3" />
          <button disabled={saving} className="rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-50">{saving ? "Adding..." : "Add Holiday"}</button>
        </form>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          {holidays.length === 0 ? <p className="p-8 text-center text-slate-500">No holidays added yet.</p> : (
            <div className="divide-y divide-slate-100">
              {holidays.map((holiday) => <div key={holiday.holidayId} className="flex items-center justify-between gap-4 p-5">
                <div><p className="font-semibold text-slate-800">{holiday.name}</p><p className="mt-1 text-sm text-slate-500">{new Date(`${holiday.holidayDate.split("T")[0]}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                <button type="button" onClick={() => removeHoliday(holiday.holidayId)} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Remove</button>
              </div>)}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default HolidayCalendar;
