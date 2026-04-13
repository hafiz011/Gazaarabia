"use client";

import { useState, useEffect, useCallback } from "react";
import { 
    BadgeDollarSign, 
    Search, 
    Filter, 
    ArrowUpRight, 
    Clock, 
    CheckCircle2, 
    AlertCircle,
    ChevronRight,
    Wallet,
    Banknote,
    History
} from "lucide-react";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import PopupAlert from "@/components/PopupAlert";
import { payoutService } from "@/lib/services/payoutService";

interface PayoutSeller {
    id: number;
    shopName: string;
    sellerName: string;
    email: string;
    pendingBalance: number;
    availableBalance: number;
    totalEarned: number;
    minimumPayout: number;
}

export default function AdminSellerPayoutsPage() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [sellers, setSellers] = useState<PayoutSeller[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState<PayoutSeller | null>(null);
    const [payoutForm, setPayoutForm] = useState({
        amount: "",
        paymentMethod: "Bank Transfer",
        paymentRef: "",
        notes: ""
    });

    const [alert, setAlert] = useState<{show: boolean, type: 'success' | 'error' | 'warning' | 'confirm', message: string}>({
        show: false,
        type: 'success',
        message: ''
    });

    const fetchData = useCallback(async () => {
        if (!session?.user?.token) return;
        try {
            setLoading(true);
            const data = await payoutService.getSellerPayouts(session.user.token);
            if (data.success) {
                setSellers(data.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchData();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status, fetchData]);

    const handlePayout = async () => {
        if (!selectedSeller || !payoutForm.amount || !session?.user?.token) return;

        try {
            const data = await payoutService.processSellerPayout(session.user.token, {
                sellerId: selectedSeller.id,
                amount: payoutForm.amount,
                paymentMethod: payoutForm.paymentMethod,
                paymentRef: payoutForm.paymentRef,
                notes: payoutForm.notes
            });

            if (data.success) {
                setAlert({
                    show: true,
                    type: 'success',
                    message: `Successfully processed payout of $${payoutForm.amount} for ${selectedSeller.shopName}`
                });
                setShowPayoutModal(false);
                fetchData();
            } else {
                setAlert({
                    show: true,
                    type: 'error',
                    message: data.message || "Failed to process payout"
                });
            }
        } catch (error) {
            setAlert({ show: true, type: 'error', message: "Communication error" });
        }
    };

    const filteredSellers = sellers.filter(s => 
        (s.shopName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (s.sellerName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const totals = sellers.reduce((acc, curr) => ({
        pending: acc.pending + (curr.pendingBalance || 0),
        available: acc.available + (curr.availableBalance || 0),
        paid: acc.paid + (curr.totalEarned || 0)
    }), { pending: 0, available: 0, paid: 0 });

    if (loading && sellers.length === 0) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header Section */}
            <div className="bg-[#1E2A4A] text-white p-8 rounded-b-[2rem] shadow-lg mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Seller Payouts</h1>
                            <p className="text-blue-200">Manage and approve seller earnings and distribution.</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => window.location.href = '/admin/payout-history'}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-2 border border-white/10"
                            >
                                <History size={18} />
                                View History
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 group hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-300">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-200">Total Pending</p>
                                    <h3 className="text-2xl font-bold">${totals.pending.toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 group hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl text-green-300">
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-green-200">Available for Payout</p>
                                    <h3 className="text-2xl font-bold">${totals.available.toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 group hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-300">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-amber-200">Total Paid (Life-time)</p>
                                    <h3 className="text-2xl font-bold">${totals.paid.toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Search & Stats Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by shop or seller name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                        <AlertCircle size={16} className="text-amber-500" />
                        <span>Payouts are eligible after the 30-day cooling period.</span>
                    </div>
                </div>

                {/* Sellers Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller / Shop</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Balance</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Balance</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Paid</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSellers.map((seller) => (
                                    <tr key={seller.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                                    {seller.shopName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{seller.shopName}</p>
                                                    <p className="text-xs text-gray-500">{seller.sellerName} • {seller.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-600 font-medium">
                                            ${seller.pendingBalance.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-green-600 font-bold">
                                                ${seller.availableBalance.toLocaleString()}
                                                {seller.availableBalance >= seller.minimumPayout && (
                                                    <span className="bg-green-100 text-[10px] uppercase px-1.5 py-0.5 rounded text-green-700 tracking-tight">Eligible</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500">
                                            ${seller.totalEarned.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button 
                                                onClick={() => {
                                                    setSelectedSeller(seller);
                                                    setPayoutForm(prev => ({ ...prev, amount: seller.availableBalance.toString() }));
                                                    setShowPayoutModal(true);
                                                }}
                                                disabled={seller.availableBalance <= 0}
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2
                                                    ${seller.availableBalance > 0 
                                                        ? "bg-[#1E2A4A] text-white hover:bg-blue-800 shadow-md shadow-blue-200" 
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                                            >
                                                <Banknote size={16} />
                                                Pay Now
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSellers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-400 italic">No sellers found match your criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Payout Modal */}
            {showPayoutModal && selectedSeller && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowPayoutModal(false)}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-[#1E2A4A] p-6 text-white text-center">
                            <h3 className="text-xl font-bold">Process Payout</h3>
                            <p className="text-blue-200 text-sm mt-1">{selectedSeller.shopName}</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount to Pay ($)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        value={payoutForm.amount}
                                        onChange={(e) => setPayoutForm(prev => ({ ...prev, amount: e.target.value }))}
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 italic">Max available: ${selectedSeller.availableBalance.toLocaleString()}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Method</label>
                                <select 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    value={payoutForm.paymentMethod}
                                    onChange={(e) => setPayoutForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                >
                                    <option>Bank Transfer</option>
                                    <option>PayPal</option>
                                    <option>Stripe Connect</option>
                                    <option>Crypto / USDT</option>
                                    <option>Manual / Cash</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Transaction Ref / Receipt #</label>
                                <input 
                                    type="text" 
                                    placeholder="TRX-123456"
                                    value={payoutForm.paymentRef}
                                    onChange={(e) => setPayoutForm(prev => ({ ...prev, paymentRef: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <button 
                                onClick={handlePayout}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                <CheckCircle2 size={20} />
                                Confirm Payment
                            </button>
                            <button 
                                onClick={() => setShowPayoutModal(false)}
                                className="w-full py-2 text-gray-400 text-sm font-medium hover:text-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PopupAlert 
                show={alert.show}
                type={alert.type}
                message={alert.message}
                onConfirm={() => setAlert(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
