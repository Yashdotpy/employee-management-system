import { useState } from "react";
import toast from "react-hot-toast";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { changeMyPassword } from "../../services/employeeService";

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("New passwords do not match."); return; }
    try {
      setSaving(true);
      await changeMyPassword({ currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      toast.success("Password changed successfully.");
    } catch (error) { toast.error(error.response?.data?.message || "Unable to change password."); }
    finally { setSaving(false); }
  }

  return <EmployeeLayout><div className="mx-auto max-w-lg"><div className="mb-8"><h1 className="text-3xl font-bold text-slate-800">Change Password</h1><p className="mt-2 text-slate-500">Use a strong password with at least 6 characters.</p></div><form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow"><PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} /><PasswordField label="New password" value={newPassword} onChange={setNewPassword} /><PasswordField label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} /><button disabled={saving} className="w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{saving ? "Updating..." : "Update Password"}</button></form></div></EmployeeLayout>;
}

function PasswordField({ label, value, onChange }) { return <label className="block text-sm font-medium text-slate-700">{label}<input type="password" value={value} onChange={(event) => onChange(event.target.value)} required minLength="6" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label>; }

export default ChangePassword;
