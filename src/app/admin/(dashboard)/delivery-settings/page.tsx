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
    const [saveLoading, setSaveLoading] = useState(false);

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

        // International fields
        internationalTitle: "",
        internationalDeliveryTime: "",
        internationalCost: "",
        internationalFreeDeliveryText: "",
        internationalCustomsText: "",
        internationalTrackingText: "",
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

                // international
                internationalTitle: data.internationalTitle || "",
                internationalDeliveryTime: data.internationalDeliveryTime || "",
                internationalCost: data.internationalCost || "",
                internationalFreeDeliveryText: data.internationalFreeDeliveryText || "",
                internationalCustomsText: data.internationalCustomsText || "",
                internationalTrackingText: data.internationalTrackingText || "",
            });
        } catch (err) {
            console.error("fetchSettings error:", err);
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
            setSaveLoading(true);
            const res = await deliverySettingsService.update(token, form);
            if (res?.success) {
                setAlert({
                    isOpen: true,
                    type: "success",
                    message: "Delivery settings updated successfully!",
                });
            } else {
                throw new Error(res?.message || "Failed to update");
            }
        } catch (err: any) {
            console.error("update error:", err);
            setAlert({
                isOpen: true,
                type: "error",
                message: err.message || "Failed to update delivery settings.",
            });
        } finally {
            setSaveLoading(false);
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
                            {/* FREE DELIVERY */}
                            <TextField label="Free Delivery Text" name="freeDeliveryText" value={form.freeDeliveryText} onChange={handleChange} fullWidth sx={fieldStyle} />

                            {/* NEXT DAY */}
                            <div className="border p-4 rounded-md bg-gray-50">
                                <h3 className="font-semibold mb-3">Next Day Delivery</h3>

                                <TextField label="Title" name="nextDayTitle" value={form.nextDayTitle} onChange={handleChange} fullWidth sx={fieldStyle} />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <TextField label="Delivery Time" name="nextDayDeliveryTime" value={form.nextDayDeliveryTime} onChange={handleChange} fullWidth sx={fieldStyle} />
                                    <TextField label="Cost" name="nextDayCost" value={form.nextDayCost} onChange={handleChange} fullWidth sx={fieldStyle} />
                                    <TextField label="Order Cut Off" name="nextDayOrderCutOff" value={form.nextDayOrderCutOff} onChange={handleChange} fullWidth sx={fieldStyle} />
                                </div>
                            </div>

                            {/* STANDARD DELIVERY */}
                            <div className="border p-4 rounded-md bg-gray-50">
                                <h3 className="font-semibold mb-3">Standard Delivery</h3>

                                <TextField label="Title" name="standardDeliveryTitle" value={form.standardDeliveryTitle} onChange={handleChange} fullWidth sx={fieldStyle} />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <TextField label="Min Days" name="standardDeliveryMinDays" type="number" value={form.standardDeliveryMinDays ?? ""} onChange={handleChange} fullWidth sx={fieldStyle} />
                                    <TextField label="Max Days" name="standardDeliveryMaxDays" type="number" value={form.standardDeliveryMaxDays ?? ""} onChange={handleChange} fullWidth sx={fieldStyle} />
                                    <TextField label="Cost" name="standardDeliveryCost" value={form.standardDeliveryCost} onChange={handleChange} fullWidth sx={fieldStyle} />
                                </div>
                            </div>

                            {/* RETURNS */}
                            <TextField label="Return Text" name="returnText" value={form.returnText} onChange={handleChange} fullWidth multiline rows={2} sx={fieldStyle} />
                            {/* ================= INTERNATIONAL DELIVERY =================== */}
                            <div className="border p-4 rounded-md bg-gray-50">
                                <h3 className="font-semibold mb-3">International / Rest of World</h3>

                                <TextField
                                    label="Title"
                                    name="internationalTitle"
                                    value={form.internationalTitle}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={fieldStyle}
                                />

                                {/* FIRST ROW — 3 FIELDS (MATCHES STANDARD & NEXT DAY GRID) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <TextField
                                        label="Delivery Time"
                                        name="internationalDeliveryTime"
                                        value={form.internationalDeliveryTime}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={fieldStyle}
                                    />

                                    <TextField
                                        label="Cost"
                                        name="internationalCost"
                                        value={form.internationalCost}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={fieldStyle}
                                    />


                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                                    <TextField
                                        label="Free Delivery Text"
                                        name="internationalFreeDeliveryText"
                                        value={form.internationalFreeDeliveryText}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={fieldStyle}
                                    />
                                </div>

                                {/* SECOND ROW — CUSTOMS & TRACKING (MATCH ALIGNMENT) */}
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                                    <TextField
                                        label="Customs / Duties Text"
                                        name="internationalCustomsText"
                                        value={form.internationalCustomsText}
                                        onChange={handleChange}
                                        fullWidth
                                        multiline
                                        rows={4}
                                        sx={fieldStyle}
                                    />

                                    {/* <TextField
                                        label="Order Tracking Text"
                                        name="internationalTrackingText"
                                        value={form.internationalTrackingText}
                                        onChange={handleChange}
                                        fullWidth
                                        multiline
                                        rows={2}
                                        sx={fieldStyle}
                                    /> */}
                                </div>
                            </div>


                            {/* SUBMIT */}
                            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                                <Button variant="outlined" onClick={() => router.push("/admin")} sx={{ color: "var(--text-primary)", borderColor: "var(--mid-gray)", "&:hover": { borderColor: "var(--text-primary)" } }}>
                                    Cancel
                                </Button>

                                <Button
                                    variant="contained"
                                    disabled={saveLoading}
                                    sx={{
                                        background: "var(--brand-primary)",
                                        opacity: saveLoading ? 0.6 : 1,
                                        cursor: saveLoading ? "not-allowed" : "pointer",
                                        "&:hover": {
                                            background: saveLoading ? "var(--brand-primary)" : "#c32230"
                                        }
                                    }}
                                    type="submit"
                                >
                                    {saveLoading ? "Saving..." : "Save Settings"}
                                </Button>

                            </div>
                        </div>
                    )}
                </Box>
            </form>

            {popup.isOpen && (
                <PopupAlert type={popup.type as any} message={popup.message} confirmText="OK" onConfirm={() => setPopup((p) => ({ ...p, isOpen: false }))} show={popup.isOpen} />
            )}
        </Box>
    );
}
