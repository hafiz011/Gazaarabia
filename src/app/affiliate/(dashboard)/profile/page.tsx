"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { affiliateService } from "@/lib/services/affiliateService";
import { useRouter } from "next/navigation";

export default function AffiliateProfilePage() {
    const { data: session, status } = useSession();
    const token = session?.user?.token;
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);

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
            } catch (err) {
                console.error(err);
            }
        })();
    }, [status, token]);

    if (!profile) return <Loader />;

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">My Profile</h1>

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
                    <p className="text-gray-600 font-medium">Commission Rate:</p>
                    <p className="text-gray-900 font-semibold">{profile.baseCommission}%</p>
                </div>


                <div className="flex justify-between">
                    <p className="text-gray-600 font-medium">Joined:</p>
                    <p className="text-gray-800 font-semibold">
                        {new Date(profile.joinedAt).toLocaleDateString("en-GB")}
                    </p>
                </div>
            </div>

            {/* <div className="bg-white rounded-xl shadow border p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Earnings Summary</h3>

                <div className="flex justify-between">
                    <p className="text-gray-600 font-medium">Total Earned:</p>
                    <p className="text-green-600 font-semibold">£{profile.totalEarned.toFixed(2)}</p>
                </div>

                <div className="flex justify-between">
                    <p className="text-gray-600 font-medium">Paid Out:</p>
                    <p className="text-blue-600 font-semibold">£{profile.paid.toFixed(2)}</p>
                </div>

                <div className="flex justify-between">
                    <p className="text-gray-600 font-medium">Pending Payouts:</p>
                    <p className="text-orange-500 font-semibold">£{profile.pending.toFixed(2)}</p>
                </div>

                <div className="flex justify-between">
                    <p className="text-gray-600 font-medium">Joined:</p>
                    <p className="text-gray-800 font-semibold">
                        {new Date(profile.joinedAt).toLocaleDateString("en-GB")}
                    </p>
                </div>
            </div> */}

        </div>
    );
}
