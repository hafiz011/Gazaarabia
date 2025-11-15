"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { charityService } from "@/lib/services/charityService";
import { ROUTES } from "@/constants/routes";
import {
    ArrowLeft,
    ExternalLink,
    FileDown,
    CalendarDays,
    User,
    Mail,
} from "lucide-react";
import { GBP } from "@/lib/utils";

export default function CharityDetailPage({ params }: any) {
    const { id } = params;
    const router = useRouter();
    const { data: session, status } = useSession();

    const allowedRoles = ["admin"];
    const token = session?.user?.token;

    const [donation, setDonation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace(ROUTES.ADMIN.LOGIN);
        } else if (
            status === "authenticated" &&
            !allowedRoles.includes(session?.user?.role)
        ) {
            router.replace(ROUTES.HOME);
        }
    }, [status, session]);

    useEffect(() => {
        if (token) fetchDonation();
    }, [token]);

    const fetchDonation = async () => {
        try {
            setLoading(true);
            const res: any = await charityService.getById(token!, Number(id));
            setDonation(res?.donation || null);
        } catch (err) {
            console.error("Failed to load donation", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return (
            <div className="p-6 text-gray-400 text-center">Loading donation…</div>
        );

    if (!donation)
        return (
            <div className="p-6 text-gray-400 text-center">Donation not found.</div>
        );

    const order = donation.order;

    const statusColors: any = {
        completed: "text-green-600 bg-green-100",
        pending: "text-yellow-700 bg-yellow-100",
        failed: "text-red-700 bg-red-100",
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-10">

            {/* TOP BAR */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push("/admin/charity")}
                    className="p-2 hover:bg-gray-100 rounded-md transition"
                >
                    <ArrowLeft size={22} />
                </button>

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Donation #{donation.id}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Detailed overview of the charity donation.
                    </p>

                </div>
            </div>

            {/* SUMMARY BAR */}
            <div className="border border-gray-200 bg-white px-6 py-5 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">

                    <div>
                        <p className="text-sm text-gray-500">Amount Donated</p>
                        <p className="text-3xl font-semibold text-gray-900">
                            {GBP.format(donation.amount)}
                        </p>
                    </div>

                    <div className="flex gap-3 items-center">
                        <span
                            className={`px-3 py-1 text-xs font-medium rounded-sm ${statusColors[donation.paymentStatus]}`}
                        >
                            {donation.paymentStatus.toUpperCase()}
                        </span>

                        {donation.receiptUrl && (
                            <a
                                href={donation.receiptUrl}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition"
                            >
                                <FileDown size={16} /> Receipt
                            </a>
                        )}
                    </div>

                </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* DONATION DETAILS */}
                <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Donation Details
                    </h2>

                    <div className="space-y-4 text-sm">
                        <DetailRow label="Payment Method" value={donation.paymentMethod || "—"} />
                        <DetailRow label="Transaction ID" value={donation.transactionId || "—"} />

                        <div className="flex items-center gap-2 text-gray-600 mt-2">
                            <CalendarDays size={17} />
                            {new Date(donation.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* DONOR DETAILS */}
                <div className="bg-white border border-gray-200 shadow-sm p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Donor Details
                    </h2>

                    <div className="space-y-4 text-sm">

                        <div className="flex items-center gap-2 text-gray-700">
                            <User size={18} className="text-gray-500" />
                            <span className="font-medium">
                                {donation.anonymous
                                    ? "Anonymous"
                                    : donation.name || order?.user?.name || "—"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                            <Mail size={18} className="text-gray-500" />
                            <span className="font-medium">{donation.email}</span>
                        </div>

                        {donation.message && (
                            <DetailRow label="Message" value={donation.message} />
                        )}
                    </div>
                </div>
            </div>

            {/* LINKED ORDER */}
            <div className="bg-white border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Linked Order
                </h2>

                {order ? (
                    <div className="border border-gray-200 bg-gray-50 px-5 py-4 rounded-sm">

                        <div className="space-y-2 text-sm text-gray-700">
                            <DetailRow label="Order ID" value={`#${order.id}`} />
                            <DetailRow
                                label="Order Total"
                                value={GBP.format(order.totalAmount)}
                            />
                            <DetailRow
                                label="Order Date"
                                value={new Date(order.createdAt).toLocaleString()}
                            />
                        </div>

                    </div>
                ) : (
                    <p className="text-gray-500">No linked order found.</p>
                )}
            </div>

        </div>
    );
}

// Small reusable component
function DetailRow({ label, value }: any) {
    return (
        <p className="flex justify-between text-gray-700 text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800">{value}</span>
        </p>
    );
}
