"use client";

import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import AlertMessage from "@/components/AlertMessage";

interface GuestAddressModalProps {
  onCancel: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function GuestAddressModal({ onCancel, onSave, initialData }: GuestAddressModalProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    country: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    type: "" as "success" | "error" | "",
    message: "",
  });

  // Prefill form if existing guest data exists
  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.email.trim() || !form.phone.trim() || !form.address1.trim()) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Please fill all required fields: First Name, Email, Phone, and Address.",
      });
      return;
    }

    try {
      setLoading(true);
      onSave(form);
      localStorage.setItem("gaza_arabia_guest_address", JSON.stringify(form));
      setAlert({
        isOpen: true,
        type: "success",
        message: "Address saved successfully!",
      });
      setTimeout(() => {
        setAlert({ isOpen: false, type: "", message: "" });
        onCancel();
      }, 1000);
    } catch (err: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save address.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      borderColor: "var(--brand-primary)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--brand-primary)",
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overflow-auto py-8">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-lg relative flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Delivery Details
        </h2>

        {/* Alert */}
        {alert.isOpen && alert.type && (
          <div className="mb-4">
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert((prev) => ({ ...prev, isOpen: false }))}
            />
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1 pt-2 pb-4 flex-grow"
        >
          <TextField
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            fullWidth
            required
            sx={fieldStyle}
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            fullWidth
            sx={fieldStyle}
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            sx={fieldStyle}
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            required
            sx={fieldStyle}
          />
          <TextField
            label="Address Line 1"
            name="address1"
            value={form.address1}
            onChange={handleChange}
            fullWidth
            required
            sx={fieldStyle}
          />
          <TextField
            label="Address Line 2"
            name="address2"
            value={form.address2}
            onChange={handleChange}
            fullWidth
            sx={fieldStyle}
          />
          <TextField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            fullWidth
            sx={fieldStyle}
          />
          <TextField
            label="Country"
            name="country"
            value={form.country}
            onChange={handleChange}
            fullWidth
            sx={fieldStyle}
          />
          <TextField
            label="Postal Code"
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
            fullWidth
            sx={fieldStyle}
          />
        </form>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 border border-[var(--mid-gray)] text-[var(--text-secondary)] rounded-md hover:bg-[var(--soft-gray)] transition disabled:opacity-60"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:opacity-90 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}
