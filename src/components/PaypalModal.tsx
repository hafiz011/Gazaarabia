"use client";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Dialog } from "@mui/material";

interface Props {
  open: boolean;
  total: number;
  onClose: () => void;
  onSuccess: (details: any) => void;
}

export default function PaypalModal({ open, total, onClose, onSuccess }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Complete Your Payment
        </h2>
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={async () => {
            const res = await fetch("/api/front-end/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ total }),
            });
            const data = await res.json();
            return data.id;
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/front-end/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID }),
            });
            const details = await res.json();
            onSuccess(details);
            onClose();
          }}
        />
      </div>
    </Dialog>
  );
}
