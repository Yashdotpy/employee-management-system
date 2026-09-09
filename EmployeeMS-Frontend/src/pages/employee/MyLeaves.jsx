import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import EmployeeLayout from "../../layouts/EmployeeLayout";
import { createLeave, getMyLeaves } from "../../services/leaveService";

const initialForm = { startDate: "", endDate: "", leaveType: "Annual Leave", reason: "" };

function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadLeaves() {
    try { setLeaves(await getMyLeaves()); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to load leave requests."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadLeaves(); }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      await createLeave(form);
      setForm(initialForm);
      toast.success("Leave request submitted.");
      loadLeaves();
    } catch (error) { toast.error(error.response?.data?.message || "Unable to submit leave request."); }
    finally { setSaving(false); }
  }

  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }

  return <EmployeeLayout><div className="mx-auto max-w-6xl"><div className="mb-8"><h1 className="text-3xl font-bold text-slate-800">Leave Management</h1><p className="mt-2 text-slate-500">Apply for leave and track approval status.</p></div>
    <form onSubmit={handleSubmit} className="mb-8 rounded-xl bg-white p-6 shadow"><div className="grid gap-5 md:grid-cols-2"><Field label="Start date"><input type="date" name="startDate" value={form.startDate} onChange={updateField} min={new Date().toISOString().split("T")[0]} required className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3" /></Field><Field label="End date"><input type="date" name="endDate" value={form.endDate} onChange={updateField} min={form.startDate || new Date().toISOString().split("T")[0]} required className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3" /></Field><Field label="Leave type"><select name="leaveType" value={form.leaveType} onChange={updateField} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3"><option>Annual Leave</option><option>Sick Leave</option><option>Casual Leave</option><option>Unpaid Leave</option></select></Field><Field label="Reason"><textarea name="reason" value={form.reason} onChange={updateField} required maxLength="500" rows="3" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3" placeholder="Reason for leave" /></Field></div><div className="mt-5 flex justify-end"><button disabled={saving} className="rounded-lg bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-50">{saving ? "Submitting..." : "Apply for Leave"}</button></div></form>
    <h2 className="mb-4 text-xl font-bold text-slate-800">My Requests</h2><div className="overflow-hidden rounded-xl bg-white shadow">{loading ? <p className="p-8 text-center text-slate-500">Loading requests...</p> : leaves.length === 0 ? <p className="p-8 text-center text-slate-500">No leave requests yet.</p> : <div className="divide-y divide-slate-100">{leaves.map((leave) => <div key={leave.leaveId} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><p className="font-semibold text-slate-800">{leave.leaveType}</p><p className="mt-1 text-sm text-slate-500">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</p><p className="mt-2 text-sm text-slate-600">{leave.reason}</p></div><Status status={leave.status} /></div>)}</div>}</div>
  </div></EmployeeLayout>;
}

function Field({ label, children }) { return <label className="block text-sm font-medium text-slate-700">{label}{children}</label>; }
function Status({ status }) { const styles = status === "Approved" ? "bg-green-100 text-green-700" : status === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"; return <span className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${styles}`}>{status}</span>; }
function formatDate(date) { return new Date(`${date.split("T")[0]}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

export default MyLeaves;
