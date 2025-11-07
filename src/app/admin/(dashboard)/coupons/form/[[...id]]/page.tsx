"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Box,
    Button,
    TextField,
    MenuItem,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import PopupAlert from "@/components/PopupAlert";
import AlertMessage from "@/components/AlertMessage";
import { couponService } from "@/lib/services/couponService";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function AddOrEditCouponPage() {
    const router = useRouter();
    const params = useParams();
    const couponId = params?.id;
    const { data: session, status } = useSession();

    const [loading, setLoading] = useState(false);
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

    const [form, setForm] = useState({
        code: "",
        discountType: "percentage",
        discountValue: "",
        maxUsage: "",
        perUserLimit: "",
        minOrderAmount: "",
        startDate: "",
        endDate: "",
        isActive: true,
    });

    const fieldStyle = {
        "& .MuiOutlinedInput-root.Mui-focused fieldset": {
            borderColor: "var(--brand-secondary)",
        },
        "& .MuiInputLabel-root.Mui-focused": { color: "var(--brand-secondary)" },
    };

    // Auth check
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
        else if (
            status === "authenticated" &&
            session?.user?.role !== "admin"
        )
            router.replace(ROUTES.HOME);
    }, [status, session, router]);

    // Load existing coupon if editing
    useEffect(() => {
        if (!couponId || !session?.user?.token) return;
        (async () => {
            try {
                const res: any = await couponService.getById(
                    session?.user?.token as string,
                    Number(couponId)
                );
                const c = res?.data;
                if (c) {
                    setForm({
                        code: c.code,
                        discountType: c.discountType,
                        discountValue: String(c.discountValue),
                        maxUsage: c.maxUsage ? String(c.maxUsage) : "",
                        perUserLimit: c.perUserLimit ? String(c.perUserLimit) : "",
                        minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : "",
                        startDate: c.startDate ? c.startDate.split("T")[0] : "",
                        endDate: c.endDate ? c.endDate.split("T")[0] : "",
                        isActive: c.isActive,
                    });
                }
            } catch (err: any) {
                setAlert({
                    isOpen: true,
                    type: "error",
                    message: err.message || "Failed to load coupon.",
                });
            }
        })();
    }, [couponId, session?.user?.token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "discountValue" && form.discountType === "percentage") {
            const num = Number(value);
            if (num > 100) {
                setPopup({
                    isOpen: true,
                    type: "warning",
                    message: "Percentage discount cannot exceed 100%.",
                });
                setForm((p) => ({ ...p, discountValue: "100" }));
                return;
            }
            if (num < 0) return;
        }
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((p) => ({ ...p, isActive: e.target.checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.code || !form.discountValue) {
            setPopup({
                isOpen: true,
                type: "warning",
                message: "Coupon code and discount value are required.",
            });
            return;
        }

        // Validate percentage range
        if (form.discountType === "percentage") {
            const val = Number(form.discountValue);
            if (val <= 0 || val > 100) {
                setPopup({
                    isOpen: true,
                    type: "warning",
                    message: "For percentage discounts, value must be between 1 and 100.",
                });
                return;
            }
        }

        if (form.discountType === "fixed" && Number(form.discountValue) <= 0) {
            setPopup({
                isOpen: true,
                type: "warning",
                message: "Fixed discount must be greater than 0.",
            });
            return;
        }

        try {
            setLoading(true);

            const payload = {
                code: form.code.trim().toUpperCase(),
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                maxUsage: form.maxUsage ? Number(form.maxUsage) : undefined,
                perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : undefined,
                minOrderAmount: form.minOrderAmount
                    ? Number(form.minOrderAmount)
                    : undefined,
                startDate: form.startDate || undefined,
                endDate: form.endDate || undefined,
                isActive: form.isActive,
            };

            if (couponId) {
                await couponService.updateCoupon(
                    session?.user?.token as string,
                    Number(couponId),
                    payload
                );
                setAlert({
                    isOpen: true,
                    type: "success",
                    message: "Coupon updated successfully!",
                });
            } else {
                await couponService.addCoupon(session?.user?.token as string, payload);
                setAlert({
                    isOpen: true,
                    type: "success",
                    message: "Coupon added successfully!",
                });
            }

            setTimeout(() => router.push("/admin/coupons"), 1200);
        } catch (err: any) {
            setAlert({
                isOpen: true,
                type: "error",
                message: err.message || "Failed to save coupon.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="p-6 max-w-4xl mx-auto">
            {alert.isOpen && (
                <AlertMessage
                    type={alert.type as "success" | "error"}
                    message={alert.message}
                    onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
                />
            )}

            <form onSubmit={handleSubmit}>
                <Box className="bg-white p-6 rounded-xl shadow border border-[var(--soft-gray)]">
                    <div className="mb-6 border-b pb-4">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            {couponId ? "Edit Coupon" : "Add New Coupon"}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <TextField
                            label="Coupon Code"
                            name="code"
                            value={form.code}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                            }
                            required
                            fullWidth
                            sx={fieldStyle}
                            inputProps={{ maxLength: 20 }}
                        />

                        <TextField
                            label="Discount Type"
                            name="discountType"
                            select
                            value={form.discountType}
                            onChange={handleChange}
                            fullWidth
                            sx={fieldStyle}
                        >
                            <MenuItem value="percentage">Percentage</MenuItem>
                            <MenuItem value="fixed">Fixed Amount</MenuItem>
                        </TextField>

                        <TextField
                            label={
                                form.discountType === "percentage"
                                    ? "Discount Percentage (%)"
                                    : "Discount Value"
                            }
                            name="discountValue"
                            type="number"
                            value={form.discountValue}
                            onChange={handleChange}
                            required
                            fullWidth
                            sx={fieldStyle}
                            inputProps={{
                                min: 0,
                                max: form.discountType === "percentage" ? 100 : undefined,
                            }}
                        />

                        <TextField
                            label="Max Usage Limit"
                            name="maxUsage"
                            type="number"
                            value={form.maxUsage}
                            onChange={handleChange}
                            fullWidth
                            sx={fieldStyle}
                        />

                        <TextField
                            label="Per User Usage Limit"
                            name="perUserLimit"
                            type="number"
                            value={form.perUserLimit}
                            onChange={handleChange}
                            fullWidth
                            sx={fieldStyle}
                        />

                        <TextField
                            label="Start Date"
                            name="startDate"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={form.startDate}
                            onChange={handleChange}
                            fullWidth
                            sx={fieldStyle}
                        />

                        <TextField
                            label="End Date"
                            name="endDate"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={form.endDate}
                            onChange={handleChange}
                            fullWidth
                            sx={fieldStyle}
                        />
                    </div>

                    <Box className="mt-6 flex items-center justify-between border-t pt-4">
                        <FormControlLabel
                            control={
                                <Checkbox checked={form.isActive} onChange={handleCheckboxChange} />
                            }
                            label="Active"
                        />

                        <div className="flex gap-3">
                            <Button
                                variant="outlined"
                                onClick={() => router.push("/admin/coupons")}
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
                                disabled={loading}
                            >
                                {couponId ? "Update Coupon" : "Create Coupon"}
                            </Button>
                        </div>
                    </Box>
                </Box>
            </form>

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
