"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Divider,
} from "@mui/material";

import Loader from "@/components/Loader";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { ROUTES } from "@/constants/routes";
import { affiliateService } from "@/lib/services/affiliateService";

export default function AffiliateBankDetailsPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    accountName: "",
    accountNumber: "",
    sortCode: "",
    iban: "",
    paypalEmail: "",
  });

  const [alert, setAlert] = useState({
    isOpen: false,
    type: "" as "success" | "error" | "",
    message: "",
  });

  const [popup, setPopup] = useState({
    isOpen: false,
    type: "" as "success" | "error" | "warning" | "",
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

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace(ROUTES.AFFILIATE.LOGIN);
      return;
    }

    if (session?.user?.role !== "affiliate") {
      router.replace(ROUTES.HOME);
      return;
    }

    loadBankDetails();
  }, [status]);

  /* ---------------- LOAD EXISTING DATA ---------------- */
  const loadBankDetails = async () => {
    try {
      const res = await affiliateService.getBankAccount(token!);
      if (res) {
        setForm({
          accountName: res.accountName || "",
          accountNumber: res.accountNumber || "",
          sortCode: res.sortCode || "",
          iban: res.iban || "",
          paypalEmail: res.paypalEmail || "",
        });
      }
    } catch {
      // No existing data → add mode
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    if (!form.accountName.trim()) {
      return "Account holder name is required.";
    }

    if (
      !form.accountNumber.trim() &&
      !form.iban.trim() &&
      !form.paypalEmail.trim()
    ) {
      return "Please provide at least one payout method.";
    }

    if (
      form.paypalEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.paypalEmail)
    ) {
      return "Please enter a valid PayPal email.";
    }

    return null;
  };

  /* ---------------- SAVE ---------------- */
  const saveBankDetails = async () => {
    const error = validate();
    if (error) {
      return setPopup({
        isOpen: true,
        type: "warning",
        message: error,
      });
    }

    try {
      await affiliateService.saveBankAccount(token!, form);

      setAlert({
        isOpen: true,
        type: "success",
        message: "Payout details saved successfully.",
      });
    } catch (err: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save payout details.",
      });
    }
  };

  if (loading) return <Loader />;

  return (
    <Box className="p-6 max-w-4xl mx-auto">
      {alert.isOpen && (
        <AlertMessage
          type={alert.type as "success" | "error"}
          message={alert.message}
          onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
        />
      )}

      <Box className="bg-white p-6 rounded-xl shadow border border-[var(--soft-gray)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 border-b pb-4">
          Payout / Bank Details
        </h2>

        {/* <Divider className="mb-6" /> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TextField
            label="Account Holder Name *"
            value={form.accountName}
            onChange={(e) =>
              setForm((p) => ({ ...p, accountName: e.target.value }))
            }
            fullWidth
            sx={fieldStyle}
          />

          <TextField
            label="Account Number"
            value={form.accountNumber}
            onChange={(e) =>
              setForm((p) => ({ ...p, accountNumber: e.target.value }))
            }
            fullWidth
            sx={fieldStyle}
          />

          <TextField
            label="Sort Code"
            value={form.sortCode}
            onChange={(e) =>
              setForm((p) => ({ ...p, sortCode: e.target.value }))
            }
            fullWidth
            sx={fieldStyle}
          />

          <TextField
            label="IBAN"
            value={form.iban}
            onChange={(e) =>
              setForm((p) => ({ ...p, iban: e.target.value }))
            }
            fullWidth
            sx={fieldStyle}
          />

          <TextField
            label="PayPal Email"
            type="email"
            value={form.paypalEmail}
            onChange={(e) =>
              setForm((p) => ({ ...p, paypalEmail: e.target.value }))
            }
            fullWidth
            sx={fieldStyle}
          />
        </div>

        <Box className="mt-6 flex justify-end gap-3 border-t pt-4">
          <Button
            variant="outlined"
            onClick={() => router.back()}
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
            onClick={saveBankDetails}
          >
            Save Details
          </Button>
        </Box>
      </Box>

      {popup.isOpen && (
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
