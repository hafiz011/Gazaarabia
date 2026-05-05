"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface, AlertInterface } from "@/lib/types";
import { userService } from "@/lib/services/userService";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function UserFormPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id?.[0];
    const isEditMode = Boolean(id);

    const { data: session, status } = useSession();
    const token = session?.user?.token;
    const alowedRoles = ["admin"];

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
    });

    const [fetching, setFetching] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");


    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
        isOpen: false,
        type: "",
        message: "",
    });

    const [alertMessageData, setAlertMessageData] = useState<AlertInterface>({
        isOpen: false,
        type: "",
        message: "",
    });

    //  Redirect unauthorized users
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.replace(ROUTES.ADMIN.LOGIN);
        } else if (
            status === "authenticated" &&
            !alowedRoles.includes(session?.user?.role)
        ) {
            router.replace(ROUTES.HOME);
        }
    }, [status, session, router]);

    useEffect(() => {
        if (isEditMode && token) fetchUserData();
    }, [id, token]);

    const fetchUserData = async () => {
        try {
            setFetching(true);

            const res: any = await userService.getById(token!, Number(id));
            const data = res?.data ?? res;

            setFormData({
                name: data.name || "",
                email: data.email || "",
                phone: data.phone || "",
                password: "",
                role: data.role?.name,
            });
        } catch (error: any) {
            setAlertMessageData({
                isOpen: true,
                type: "error",
                message: error.message || "Failed to load user details.",
            });
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const validateUserForm = () => {

        // Name
        if (!formData.name.trim()) {
            return {
                valid: false,
                message: "User name is required.",
            };
        }

        // Email
        if (!formData.email.trim()) {
            return {
                valid: false,
                message: "Email is required.",
            };
        }

        // CREATE MODE — password required
        if (!isEditMode) {
            if (!formData.password.trim()) {
                return {
                    valid: false,
                    message: "Password is required for new user.",
                };
            }

            if (formData.password.length < 6) {
                return {
                    valid: false,
                    message: "Password must be at least 6 characters long.",
                };
            }

            if (confirmPassword !== formData.password) {
                return {
                    valid: false,
                    message: "Passwords do not match.",
                };
            }
        }

        // EDIT MODE — validate ONLY if password entered
        if (isEditMode && formData.password.trim() !== "") {
            if (formData.password.length < 6) {
                return {
                    valid: false,
                    message: "New password must be at least 6 characters long.",
                };
            }

            if (confirmPassword !== formData.password) {
                return {
                    valid: false,
                    message: "Passwords do not match.",
                };
            }
        }

        // Role
        if (!formData.role) {
            return {
                valid: false,
                message: "Please select a role.",
            };
        }

        return { valid: true };
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation: any = validateUserForm();
        if (!validation.valid) {
            return setPopUpAlertData({
                isOpen: true,
                type: "warning",
                message: validation.message,
                onConfirm: () =>
                    setPopUpAlertData(prev => ({ ...prev, isOpen: false })),
            });
        }

        try {
            setSubmitting(true);
            setAlertMessageData({ isOpen: false, type: "", message: "" });

            if (isEditMode) {
                const payload: any = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.role,
                };

                if (formData.password.trim() !== "") {
                    payload.password = formData.password;
                }

                await userService.update(token!, Number(id), payload);

                setAlertMessageData({
                    isOpen: true,
                    type: "success",
                    message: "User updated successfully!",
                });

            } else {
                const payload = {
                    ...formData,
                    role: formData.role,
                };

                await userService.create(token!, payload);

                setAlertMessageData({
                    isOpen: true,
                    type: "success",
                    message: "User added successfully!",
                });
            }

            setTimeout(() => router.push("/admin/users"), 1000);

        } catch (err: any) {
            setAlertMessageData({
                isOpen: true,
                type: "error",
                message: err.message || "Failed to save user.",
            });
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
                <h1 className="text-2xl font-semibold mb-6">
                    {isEditMode ? "Edit User" : "Add User"}
                </h1>

                {alertMessageData.isOpen && alertMessageData.type && (
                    <AlertMessage
                        type={alertMessageData.type}
                        message={alertMessageData.message}
                        onClose={() =>
                            setAlertMessageData((prev) => ({ ...prev, isOpen: false }))
                        }
                    />
                )}

                {fetching && isEditMode && !formData.name ? (
                    <p>Loading...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Name */}
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 mb-5"
                            placeholder="Enter full name"
                            required
                        />

                        {/* Email */}
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 mb-5"
                            type="email"
                            placeholder="Enter email"
                            required
                            disabled={isEditMode}
                        />

                        {/* Phone */}
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Phone (optional)
                        </label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 mb-5"
                            placeholder="Enter phone number"
                        />

                        {/* Password */}
                        {!isEditMode && (
                            <>
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 mb-5"
                                        placeholder="Enter password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-sm text-gray-600"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full border rounded px-3 py-2 mb-5"
                                        placeholder="Confirm password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-2.5 text-sm text-gray-600"
                                    >
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>


                            </>
                        )}

                        {isEditMode && (
                            <>
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    New Password (optional)
                                </label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 mb-5"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-sm text-gray-600"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                {/* Confirm password only if user enters new password */}
                                {formData.password.trim() !== "" && (
                                    <>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full border rounded px-3 py-2 mb-5"
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-2.5 text-sm text-gray-600"
                                            >
                                                {showConfirmPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                    </>
                                )}

                            </>
                        )}

                        {/* Role */}
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 mb-5"
                            disabled={isEditMode}
                        >
                            <option value="">Select role</option>
                            <option value="customer">Customer</option>
                            <option value="content_manager">Content Manager</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                            <option value="affiliate">Affiliate</option>
                        </select>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.push("/admin/users")}
                                className="px-4 py-2 rounded border"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 rounded bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)] transition flex items-center gap-2"
                            >
                                {submitting && (
                                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                )}
                                {submitting
                                    ? isEditMode
                                        ? "Updating..."
                                        : "Saving..."
                                    : isEditMode
                                        ? "Update"
                                        : "Add"}
                            </button>
                        </div>
                    </form>
                )}

                <PopupAlert
                    type={popUpAlertData.type as any}
                    message={popUpAlertData.message}
                    confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
                    cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
                    onConfirm={popUpAlertData.onConfirm}
                    onCancel={popUpAlertData.onCancel}
                    show={popUpAlertData.isOpen}
                />
            </div>
        </div>
    );
}
