"use client";

import { useState, useEffect } from "react";
import { TextField, Box, Button, FormHelperText } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { deliveryOptionService } from "@/lib/services/deliveryOptionService";
import { ROUTES } from "@/constants/routes";

export default function CreateOrUpdateDeliveryOptionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id?.[0]; // [[...id]] returns array
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    name: "",
    description: "",
    minTime: undefined as number | undefined,
    maxTime: undefined as number | undefined,
    cutOffTime: "",
    cost: undefined as number | undefined,
    freeOver: undefined as number | undefined,
    status: "Active",
  });

  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | ""; message: string }>({
    isOpen: false,
    type: "",
    message: "",
  });

  const [popup, setPopup] = useState<{ isOpen: boolean; type: "success" | "error" | "warning" | ""; message: string }>({
    isOpen: false,
    type: "",
    message: "",
  });

  const fieldStyle = {
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      borderColor: "var(--brand-secondary)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--brand-secondary)",
    },
  };

  //  Redirect unauthorized users
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.ADMIN.LOGIN);
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace(ROUTES.HOME);
    }
  }, [status, session, router]);

  //  Hydrate page & fetch data if editing
  useEffect(() => {
    setHydrated(true);
    if (id && session?.user?.token) {
      fetchDeliveryOption(Number(id));
    }
  }, [id, session?.user?.token]);

  //  Fetch existing data (edit mode)
  const fetchDeliveryOption = async (deliveryId: number) => {
    try {
      setLoading(true);
      const res: any = await deliveryOptionService.getById(session?.user?.token as string, deliveryId);
      const data = res?.data ?? null;
      setForm({
        name: data.name || "",
        description: data.description || "",
        minTime: data.minTime,
        maxTime: data.maxTime,
        cutOffTime: data.cutOffTime || "",
        cost: data.cost,
        freeOver: data.freeOver,
        status: data.status || "Active",
      });
    } catch (err: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to load delivery option.",
      });
    } finally {
      setLoading(false);
    }
  };

  //  Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? undefined : Number(value)) : value,
    }));
  };

  //  Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setPopup({ isOpen: true, type: "warning", message: "Please enter a name." });
      return;
    }
    if (
      form.minTime === undefined ||
      form.maxTime === undefined ||
      form.cost === undefined ||
      !form.cutOffTime
    ) {
      setPopup({
        isOpen: true,
        type: "warning",
        message: "Please fill all required fields.",
      });
      return;
    }

    try {
      const token = session?.user?.token as string;
      if (id) {
        //  Update
        await deliveryOptionService.update(token, Number(id), form);
        setAlert({
          isOpen: true,
          type: "success",
          message: "Delivery option updated successfully!",
        });
      } else {
        // ➕ Create
        await deliveryOptionService.create(token, form);
        setAlert({
          isOpen: true,
          type: "success",
          message: "Delivery option created successfully!",
        });
      }

      setTimeout(() => router.push("/admin/delivery-options"), 1200);
    } catch (err: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: err.message || `Failed to ${id ? "update" : "create"} delivery option.`,
      });
    }
  };

  if (!hydrated) return null;

  return (
    <Box className="p-6 max-w-4xl mx-auto">
      {alert.isOpen && (alert.type === "success" || alert.type === "error") && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Box className="bg-white p-6 rounded-xl shadow border border-[var(--soft-gray)]">
          <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {id ? "Edit Delivery Option" : "Create Delivery Option"}
            </h2>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm py-4">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/*  Name */}
              <TextField
                label="Name"
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                sx={fieldStyle}
              />

              {/*  Description */}
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                sx={fieldStyle}
              />

              {/* ⏱ Delivery Times */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  label="Delivery time min"
                  required
                  name="minTime"
                  type="number"
                  value={form.minTime ?? ""}
                  onChange={handleChange}
                  fullWidth
                  sx={fieldStyle}
                />
                <TextField
                  label="Delivery time max"
                  required
                  name="maxTime"
                  type="number"
                  value={form.maxTime ?? ""}
                  onChange={handleChange}
                  fullWidth
                  sx={fieldStyle}
                />
                <TextField
                  label="Cut off time"
                  required
                  name="cutOffTime"
                  type="time"
                  value={form.cutOffTime}
                  onChange={handleChange}
                  fullWidth
                  sx={fieldStyle}
                  InputLabelProps={{ shrink: true }}
                />
              </div>

              {/*  Cost & Free Over */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Cost"
                  required
                  name="cost"
                  type="number"
                  value={form.cost ?? ""}
                  onChange={handleChange}
                  fullWidth
                  sx={fieldStyle}
                />
                <div>
                  <TextField
                    label="Free over amount"
                    name="freeOver"
                    type="number"
                    value={form.freeOver ?? ""}
                    onChange={handleChange}
                    fullWidth
                    sx={fieldStyle}
                  />
                  <FormHelperText sx={{ marginLeft: "14px", color: "var(--text-muted)" }}>
                    Free if order value above this amount
                  </FormHelperText>
                </div>
              </div>

              {/*  Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <Button
                  variant="outlined"
                  onClick={() => router.push("/admin/delivery-options")}
                  sx={{
                    color: "var(--text-primary)",
                    borderColor: "var(--mid-gray)",
                    "&:hover": { borderColor: "var(--text-primary)" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    background: "var(--brand-primary)",
                    "&:hover": { background: "#c32230" },
                  }}
                  type="submit"
                >
                  {id ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          )}
        </Box>
      </form>

      {popup.isOpen && popup.type && (
        <PopupAlert
          type={popup.type as any}
          message={popup.message}
          confirmText="OK"
          onConfirm={() => setPopup((p) => ({ ...p, isOpen: false }))}
          show={popup.isOpen}
        />
      )}
    </Box>
  );
}
