import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import { getLeaves, updateLeaveStatus } from "../../services/leaveService";

function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);

  async function loadLeaves() {
    try { setLeaves(await getLeaves()); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to load leave requests."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadLeaves(); }, []);

  async function review(id, status) {
    try { await updateLeaveStatus(id, status); toast.success(`Leave ${status.toLowerCase()}.`); loadLeaves(); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to update leave request."); }
  }

  const visibleLeaves = leaves.filter((leave) => !filter || leave.status === filter);

  return <AdminLayout><div className="mx-auto max-w-7xl"><div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold text-slate-800">Leave Management</h1><p className="mt-2 text-slate-500">Review employee leave requests.</p></div><select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5"><option value="">All requests</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></div>
    <div className="overflow-hidden rounded-xl bg-white shadow">{loading ? <p className="p-10 text-center text-slate-500">Loading requests...</p> : visibleLeaves.length === 0 ? <p className="p-10 text-center text-slate-500">No leave requests found.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50"><tr>{["Employee", "Dates", "Type", "Reason", "Status", "Actions"].map((title) => <th key={title} className="px-5 py-4 text-sm font-semibold text-slate-600">{title}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visibleLeaves.map((leave) => <tr key={leave.leaveId}><td className="px-5 py-4 font-medium text-slate-800">{leave.employeeName}</td><td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</td><td className="px-5 py-4 text-sm text-slate-600">{leave.leaveType}</td><td className="max-w-xs px-5 py-4 text-sm text-slate-600">{leave.reason}</td><td className="px-5 py-4"><Status status={leave.status} /></td><td className="px-5 py-4">{leave.status === "Pending" ? <div className="flex gap-2"><button onClick={() => review(leave.leaveId, "Approved")} className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100">Approve</button><button onClick={() => review(leave.leaveId, "Rejected")} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">Reject</button></div> : <span className="text-sm text-slate-400">Reviewed</span>}</td></tr>)}</tbody></table></div>}</div>
  </div></AdminLayout>;
}

function Status({ status }) { const styles = status === "Approved" ? "bg-green-100 text-green-700" : status === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"; return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>{status}</span>; }
function formatDate(date) { return new Date(`${date.split("T")[0]}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

export default LeaveManagement;
