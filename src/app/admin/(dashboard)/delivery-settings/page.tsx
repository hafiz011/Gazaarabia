"use client";

import { useEffect, useState } from "react";
import { TextField, Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { deliverySettingsService } from "@/lib/services/deliverySettingsService";
import { ROUTES } from "@/constants/routes";

export default function DeliverySettingsPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [hydrated, setHydrated] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        freeDeliveryText: "",

        nextDayTitle: "",
        nextDayDeliveryTime: "",
        nextDayCost: "",
        nextDayOrderCutOff: "",

        standardDeliveryTitle: "",
        standardDeliveryMinDays: undefined as number | undefined,
        standardDeliveryMaxDays: undefined as number | undefined,
        standardDeliveryCost: "",

        returnText: "",
    });

    const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | ""; message: string }>({
        isOpen: false,
        type: "",
        message: "",
    });

    const [popup, setPopup] = useState<{ isOpen: boolean; type: "warning" | ""; message: string }>({
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

    // ---------------- AUTH GUARD ----------------
    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace(ROUTES.ADMIN.LOGIN);
            return;
        }

        if (session?.user?.role !== "admin") {
            router.replace(ROUTES.HOME);
            return;
        }
    }, [status, session, router]);

    // -------------- FETCH SETTINGS --------------
    useEffect(() => {
        setHydrated(true);
        if (session?.user?.token) fetchSettings();
    }, [session?.user?.token]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res: any = await deliverySettingsService.get(session?.user?.token as string);
            const data = res?.data ?? {};

            setForm({
                freeDeliveryText: data.freeDeliveryText || "",

                nextDayTitle: data.nextDayTitle || "",
                nextDayDeliveryTime: data.nextDayDeliveryTime || "",
                nextDayCost: data.nextDayCost || "",
                nextDayOrderCutOff: data.nextDayOrderCutOff || "",

                standardDeliveryTitle: data.standardDeliveryTitle || "",
                standardDeliveryMinDays: data.standardDeliveryMinDays,
                standardDeliveryMaxDays: data.standardDeliveryMaxDays,
                standardDeliveryCost: data.standardDeliveryCost || "",

                returnText: data.returnText || "",
            });
        } catch {
            setAlert({
                isOpen: true,
                type: "error",
                message: "Failed to load delivery settings.",
            });
        } finally {
            setLoading(false);
        }
    };

    // -------------- HANDLE INPUT ----------------
    const handleChange = (e: any) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? undefined : Number(value)) : value,
        }));
    };

    // -------------- HANDLE SUBMIT ----------------
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const token = session?.user?.token as string;
            await deliverySettingsService.update(token, form);

            setAlert({
                isOpen: true,
                type: "success",
                message: "Delivery settings updated successfully!",
            });
        } catch (err: any) {
            setAlert({
                isOpen: true,
                type: "error",
                message: err.message || "Failed to update delivery settings.",
            });
        }
    };

    if (!hydrated) return null;

    return (
        <Box className="p-6 max-w-4xl mx-auto">
            {(alert.isOpen && alert.type) && (
                <AlertMessage
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
                />
            )}

            <form onSubmit={handleSubmit}>
                <Box className="bg-white p-6 rounded-xl shadow border border-[var(--soft-gray)]">

                    <div className="mb-6 border-b pb-4">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Delivery Settings</h2>
                    </div>

                    {loading ? (
                        <p className="text-gray-500 text-sm py-4">Loading...</p>
                    ) : (
                        <div className="space-y-6">

                            {/* ================= FREE DELIVERY ================ */}
                            <TextField
                                label="Free Delivery Text"
                                name="freeDeliveryText"
                                value={form.freeDeliveryText}
                                onChange={handleChange}
                                fullWidth
                                sx={fieldStyle}
                            />

                            {/* ================= NEXT DAY ===================== */}
                            <div className="border p-4 rounded-md bg-gray-50">
                                <h3 className="font-semibold mb-3">Next Day Delivery</h3>

                                <TextField
                                    label="Title"
                                    name="nextDayTitle"
                                    value={form.nextDayTitle}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={fieldStyle}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <TextField
                                        label="Delivery Time"
                                        name="nextDayDeliveryTime"
                                        value={form.nextDayDeliveryTime}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={fieldStyle}
                                    />

                                    <TextField
                                        label="Cost"
                                        name="nextDayCost"
                                        value={form.nextDayCost}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={fieldStyle}
                                    />

                                    <TextField
                                        label="Order Cut Off"
                                        name="nextDayOrderCutOff"
                                        value={form.nextDayOrderCutOff}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={fieldStyle}
                                    />
                                </div>
                            </div>

                            {/* ================= STANDARD DELIVERY ============== */}
                            <div className="border p-4 rounded-md bg-gray-50">
                                <h3 className="font-semibold mb-3">Standard Delivery</h3>

                                <TextField
                                    label="Title"
                                    name="standardDeliveryTitle"
                                    value={form.standardDeliveryTitle}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={fieldStyle}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <TextField
                                        label="Min Days"
                                        name="standardDeliveryMinDays"
                                        type="number"
                                        value={form.standardDeliveryMinDays ?? ""}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={fieldStyle}
                                    />

                                    <TextField
                                        label="Max Days"
                                        name="standardDeliveryMaxDays"
                                        type="number"
                                        value={form.standardDeliveryMaxDays ?? ""}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={fieldStyle}
                                    />

                                    <TextField
                                        label="Cost"
                                        name="standardDeliveryCost"
                                        value={form.standardDeliveryCost}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={fieldStyle}
                                    />
                                </div>
                            </div>

                            {/* ================= RETURNS =================== */}
                            <TextField
                                label="Return Text"
                                name="returnText"
                                value={form.returnText}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={2}
                                sx={fieldStyle}
                            />

                            {/* SUBMIT */}
                            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                                <Button
                                    variant="outlined"
                                    onClick={() => router.push("/admin")}
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
                                    Save Settings
                                </Button>
                            </div>
                        </div>
                    )}
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
