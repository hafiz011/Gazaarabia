"use client";

import { useEffect, useState } from "react";
import { Box, Button, TextField, FormControlLabel, Checkbox } from "@mui/material";
import AlertMessage from "@/components/AlertMessage";
import { affiliateService } from "@/lib/services/affiliateService";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function AddOrEditAffiliatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const affiliateId = params?.id;
  const isEdit = Boolean(affiliateId);

  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    type: "",
    baseCommission: "10",
    shareCommission: "7",
    isActive: true,
  });

  const [alert, setAlert] = useState({ isOpen: false, type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const fieldStyle = {
    "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "var(--brand-secondary)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "var(--brand-secondary)" },
  };

  // Load details in edit
  useEffect(() => {
    if (!isEdit || !session?.user?.token) return;

    (async () => {
      try {
        const res: any = await affiliateService.getById(session?.user?.token, Number(affiliateId));
        const a = res?.data;
        setForm({
          name: a.user.name,
          email: a.user.email,
          phone: a.user.phone || "",
          password: "",
          type: "affiliate",
          baseCommission: String(a.baseCommission),
          shareCommission: String(a.shareCommission),
          isActive: a.isActive,
        });
      } catch {
        setAlert({ isOpen: true, type: "error", message: "Failed to load affiliate." });
      }
    })();
  }, [affiliateId, session?.user?.token, isEdit]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Password validation only if admin chooses to update it
    if (!isEdit && form.password.length < 6) {
      return setAlert({ isOpen: true, type: "error", message: "Password must be at least 6 characters." });
    }
    if (isEdit && changePassword && form.password.length < 6) {
      return setAlert({ isOpen: true, type: "error", message: "New password must be at least 6 characters." });
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        baseCommission: Number(form.baseCommission),
        shareCommission: Number(form.shareCommission),
        ...(changePassword || !isEdit ? { password: form.password } : {}), // apply only if changed
      };

      if (isEdit) {
        await affiliateService.update(session?.user?.token as string, Number(affiliateId), payload);
        setAlert({ isOpen: true, type: "success", message: "Affiliate updated successfully!" });
      } else {
        await affiliateService.create(session?.user?.token as string, payload);
        setAlert({ isOpen: true, type: "success", message: "Affiliate added successfully!" });
      }

      setTimeout(() => router.push("/admin/affiliates"), 1200);
    } catch (err: any) {
      setAlert({ isOpen: true, type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-6 max-w-4xl mx-auto">

      {alert.isOpen && (
        <AlertMessage
          type={alert.type as any}
          message={alert.message}
          onClose={() => setAlert({ isOpen: false, type: "", message: "" })}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Box className="bg-white p-6 rounded-xl shadow border border-[var(--soft-gray)]">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">
            {isEdit ? "Edit Affiliate" : "Add New Affiliate"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField fullWidth label="Full Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} sx={fieldStyle} />
            <TextField fullWidth label="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} sx={fieldStyle} />
            <TextField fullWidth label="Phone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} sx={fieldStyle} />

            <TextField fullWidth type="number" label="Base Commission (%)" value={form.baseCommission}
              onChange={(e) => setForm({ ...form, baseCommission: e.target.value })} sx={fieldStyle} />

            <select
              className="border p-3 rounded"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="affiliate">Normal Affiliate</option>
              <option value="ambassador">Ambassador</option>
            </select>


            {/* Password / Change Password */}
            <div className="sm:col-span-2">
              {!isEdit ? (
                // ADD MODE
                <div className="relative">
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    sx={fieldStyle}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              ) : (
                // EDIT MODE
                <>
                  {!changePassword ? (
                    <button
                      type="button"
                      onClick={() => setChangePassword(true)}
                      className="text-sm text-[var(--brand-primary)] hover:underline"
                    >
                      Change Password
                    </button>
                  ) : (
                    <div className="relative">
                      <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="New Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        sx={fieldStyle}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>

                      <button
                        type="button"
                        onClick={() => { setChangePassword(false); setForm({ ...form, password: "" }); }}
                        className="text-xs text-gray-500 hover:underline mt-1 block"
                      >
                        Cancel Change
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>


          </div>

          <Box className="mt-6 flex items-center justify-between border-t pt-4">
            <FormControlLabel
              control={<Checkbox checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
              label="Active"
            />

            <div className="flex gap-3">
              <Button variant="outlined" onClick={() => router.push("/admin/affiliates")}>Cancel</Button>
              <Button variant="contained" type="submit" disabled={loading}
                sx={{ background: "var(--brand-primary)" }}>
                {isEdit ? "Update Affiliate" : "Create Affiliate"}
              </Button>
            </div>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
