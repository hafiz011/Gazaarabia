"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { affiliateService } from "@/lib/services/affiliateService";
import { useRouter } from "next/navigation";
import PopupAlert from "@/components/PopupAlert";
import AlertMessage from "@/components/AlertMessage";

export default function AffiliateProfilePage() {
    const { data: session, status } = useSession();
    const token = session?.user?.token;
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [shareCommission, setShareCommission] = useState("");

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

    const [copied, setCopied] = useState(false);


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

        (async () => {
            try {
                const res = await affiliateService.getProfile(token as string);
                setProfile(res);
                setShareCommission(res?.shareCommission || "");
            } catch (err: any) {
                setAlert({
                    isOpen: true,
                    type: "error",
                    message: err.message || "Failed to load profile.",
                });
            }
        })();
    }, [status, token]);

    const updateCommission = async () => {
        const value = Number(shareCommission);

        if (value < 0) {
            return setPopup({
                isOpen: true,
                type: "warning",
                message: "Commission cannot be negative.",
            });
        }

        if (value > profile.baseCommission) {
            return setPopup({
                isOpen: true,
                type: "warning",
                message: `Share Commission cannot exceed your Base Commission (${profile.baseCommission}%).`,
            });
        }

        try {
            await affiliateService.updateShareCommission(token!, value);

            setAlert({
                isOpen: true,
                type: "success",
                message: "Commission updated successfully!",
            });
        } catch (err: any) {
            setAlert({
                isOpen: true,
                type: "error",
                message: err.message || "Failed to update commission.",
            });
        }
    };

    if (!profile) return <Loader />;

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            {alert.isOpen && (
                <AlertMessage
                    type={alert.type as "success" | "error"}
                    message={alert.message}
                    onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
                />
            )}

            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
                My Profile
            </h1>

            <div className="bg-white rounded-xl shadow border p-6 space-y-4">
                <div className="flex justify-between">
                    <p className="text-gray-600 font-medium">Name:</p>
                    <p className="text-gray-900 font-semibold">{profile.name}</p>
                </div>

                <div className="flex justify-between">
                    <p className="text-gray-600 font-medium">Email:</p>
                    <p className="text-gray-900 font-semibold">{profile.email}</p>
                </div>

                <div className="flex justify-between">
                    <p className="text-gray-600 font-medium">Base Commission:</p>
                    <p className="text-gray-900 font-semibold">
                        {profile.baseCommission}%
                    </p>
                </div>

                <div className="flex justify-between">
                    <p className="text-gray-600 font-medium">Current Share Commission:</p>
                    <p className="text-gray-900 font-semibold">
                        {profile.shareCommission}%
                    </p>
                </div>
            </div>

            {/* UPDATE SHARE COMMISSION */}
            <div className="bg-white p-6 shadow rounded-xl space-y-4">
                <label className="block text-gray-600 font-medium">
                    Update Share Commission (%)
                </label>

                <input
                    type="number"
                    value={shareCommission}
                    onChange={(e) => setShareCommission(e.target.value)}
                    className="border rounded-lg p-2 w-full"
                />

                <button
                    onClick={updateCommission}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                    Save
                </button>
            </div>


            {/* UPDATE SHARE COMMISSION */}
            <div className="bg-white rounded-xl shadow border p-6 space-y-4 mt-6">
                <h2 className="text-lg font-semibold text-gray-800">Your Referral Link</h2>

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        readOnly
                        value={`${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${profile.referralCode}`}
                        className="p-2 border rounded-lg w-full"
                    />

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${profile.referralCode}`
                            );
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                        }}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg"
                    >
                        Copy
                    </button>
                </div>

                {copied && (
                    <p className="text-green-600 text-sm font-medium mt-1">
                        Referral link copied!
                    </p>
                )}
            </div>


            {(popup.isOpen && popup.type) && (
                <PopupAlert
                    type={popup.type}
                    message={popup.message}
                    confirmText="OK"
                    onConfirm={() => setPopup((p) => ({ ...p, isOpen: false }))}
                    show={popup.isOpen}
                />
            )}
        </div>
    );
}
