"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

import { subscriberService } from "@/lib/services/subscriberService";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";

export default function SubscriberFormPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const allowedRoles = ["admin"];
    const token = session?.user?.token;

    const isEdit = params.id !== "new";
    const subscriberId = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [popup, setPopup] = useState<PopUpInterface>({
        isOpen: false,
        type: "",
        message: "",
    });

    // Protect unauthorized users
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
        if (status === "authenticated" && !allowedRoles.includes(session?.user?.role))
            router.replace(ROUTES.HOME);
    }, [status, session]);

    // Fetch single subscriber if edit mode
    useEffect(() => {
        if (!token || !isEdit) {
            setLoading(false);
            return;
        }

        const fetchSubscriber = async () => {
            try {
                const res: any = await subscriberService.getById(token!, subscriberId);
                const data = res?.data;

                if (data) {
                    setEmail(data.email);
                    setName(data.name || "");
                    setPhone(data.phone || "");
                    setIsActive(data.isActive);
                }
            } catch (err) {
                console.error("Failed to fetch subscriber:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriber();
    }, [token, isEdit, subscriberId]);

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);

        try {
            await subscriberService.update(token!, subscriberId, {
                name,
                phone,
                isActive,
            });

            setPopup({
                isOpen: true,
                type: "success",
                message: "Subscriber updated successfully!",
                onConfirm: () => {
                    setPopup((prev) => ({ ...prev, isOpen: false }));
                    router.push("/admin/subscribers");
                },
            });
        } catch (err: any) {
            setPopup({
                isOpen: true,
                type: "error",
                message: err.message || "Failed to save changes",
                onConfirm: () =>
                    setPopup((prev) => ({ ...prev, isOpen: false })),
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto text-center text-gray-500">
                Loading subscriber...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">

                <h1 className="text-xl font-semibold text-gray-800 mb-4">
                    {isEdit ? "Edit Subscriber" : "Add Subscriber"}
                </h1>

                {/* Email (read-only) */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                    />
                </div>

                {/* Name */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="Enter name"
                    />
                </div>

                {/* Phone */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="Enter phone"
                    />
                </div>

                {/* Status Toggle */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        value={isActive ? "active" : "inactive"}
                        onChange={(e) => setIsActive(e.target.value === "active")}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => router.push("/admin/subscribers")}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 rounded-lg bg-[var(--brand-primary)] text-white font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <PopupAlert
                type={popup.type as any}
                message={popup.message}
                show={popup.isOpen}
                confirmText={popup.type === "confirm" ? "Yes" : "OK"}
                cancelText={popup.type === "confirm" ? "Cancel" : undefined}
                onConfirm={popup.onConfirm}
                onCancel={popup.onCancel}
            />
        </div>
    );
}
