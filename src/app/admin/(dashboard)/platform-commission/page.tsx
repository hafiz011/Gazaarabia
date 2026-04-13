"use client";

import { useEffect, useState } from "react";
import { TextField, Box, Button, Typography, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AlertMessage from "@/components/AlertMessage";
import { platformCommissionService } from "@/lib/services/platformCommissionService";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";

export default function PlatformCommissionPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [hydrated, setHydrated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [commission, setCommission] = useState<number | string>("");

    const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | ""; message: string }>({
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

        if (session?.user?.role?.toLowerCase() !== "admin") {
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
            const res = await platformCommissionService.get(session?.user?.token as string);
            if (res?.success && res.data) {
                setCommission(res.data.defaultCommissionValue ?? "");
            }
        } catch (err) {
            console.error("fetchSettings error:", err);
            setAlert({
                isOpen: true,
                type: "error",
                message: "Failed to load platform commission settings.",
            });
        } finally {
            setLoading(false);
        }
    };

    // -------------- HANDLE SUBMIT ----------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const val = Number(commission);
        if (isNaN(val) || val < 0 || val > 100) {
            setAlert({
                isOpen: true,
                type: "error",
                message: "Please enter a valid percentage between 0 and 100.",
            });
            return;
        }

        try {
            const token = session?.user?.token as string;
            setSaveLoading(true);
            const res = await platformCommissionService.update(token, { commission: val });
            if (res?.success) {
                setAlert({
                    isOpen: true,
                    type: "success",
                    message: "Platform commission updated successfully!",
                });
            } else {
                throw new Error(res?.message || "Failed to update");
            }
        } catch (err: any) {
            console.error("update error:", err);
            setAlert({
                isOpen: true,
                type: "error",
                message: err.message || "Failed to update platform commission.",
            });
        } finally {
            setSaveLoading(false);
        }
    };

    if (!hydrated) return null;

    return (
        <Box className="p-6 max-w-2xl mx-auto">
            <Typography variant="h5" className="mb-6 font-bold text-[var(--text-primary)]">
                Platform Commission Management
            </Typography>

            {(alert.isOpen && alert.type) && (
                <AlertMessage
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
                />
            )}

            <Paper elevation={0} className="p-6 rounded-xl border border-[var(--soft-gray)] bg-white">
                <Typography variant="subtitle1" className="mb-4 text-gray-600">
                    Set the default commission percentage charged by the platform for each order.
                </Typography>

                {loading ? (
                    <Box className="flex justify-center py-10">
                        <Loader />
                    </Box>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <TextField
                            label="Default Commission (%)"
                            type="number"
                            fullWidth
                            value={commission}
                            onChange={(e) => setCommission(e.target.value)}
                            inputProps={{ step: "0.01", min: "0", max: "100" }}
                            sx={fieldStyle}
                            helperText="This percentage will be applied to sellers unless a custom rate is set."
                        />

                        <Box className="flex justify-end gap-3 mt-8">
                            <Button
                                variant="outlined"
                                onClick={() => router.push("/admin")}
                                sx={{
                                    color: "var(--text-primary)",
                                    borderColor: "var(--mid-gray)",
                                    "&:hover": { borderColor: "var(--text-primary)" }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={saveLoading}
                                sx={{
                                    background: "var(--brand-primary)",
                                    "&:hover": { background: "#c32230" },
                                    px: 4
                                }}
                            >
                                {saveLoading ? "Saving..." : "Save Commission"}
                            </Button>
                        </Box>
                    </form>
                )}
            </Paper>
        </Box>
    );
}
