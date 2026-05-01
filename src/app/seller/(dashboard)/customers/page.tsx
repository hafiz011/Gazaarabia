"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Search,
    User,
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    DollarSign,
    MoreVertical,
    Download,
    Filter,
    ArrowUpRight,
    Users
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { customerService } from "@/lib/services/seller/customerService";
import Loader from "@/components/Loader";
import { ROUTES } from "@/constants/routes";

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    memberSince: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string | null;
}

export default function CustomersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.SELLER.LOGIN);
        else if (session?.user?.token) {
            (async () => {
                try {
                    setLoading(true);
                    const data = await customerService.getCustomers(session.user.token);
                    setCustomers(data || []);
                } catch (err) {
                    console.error("Failed to fetch customers", err);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [status, session, router]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    const stats = useMemo(() => {
        const total = customers.length;
        const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0);
        const avgLTV = total > 0 ? totalRevenue / total : 0;
        const repeatCustomers = customers.filter(c => c.totalOrders > 1).length;

        return { total, avgLTV, repeatCustomers };
    }, [customers]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
        }).format(amount);
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Your Customers</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage and understand your buyer base.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        <Download size={16} />
                        Export List
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Customers", value: stats.total, icon: Users, color: "blue", desc: "Unique buyers" },
                    { label: "Avg. Lifetime Value", value: formatCurrency(stats.avgLTV), icon: DollarSign, color: "emerald", desc: "Revenue per user" },
                    { label: "Repeat Customers", value: stats.repeatCustomers, icon: ShoppingBag, color: "indigo", desc: "More than 1 order" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-${stat.color}-500/5 rounded-full group-hover:scale-125 transition-transform duration-700`} />
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-2">{stat.value}</h3>
                            <p className="text-xs font-medium text-gray-400 mt-2">{stat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                            <Filter size={16} />
                            Filters
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer Info</th>
                                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Orders</th>
                                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Lifetime Spent</th>
                                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Member Since</th>
                                {/* <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-black text-lg border border-blue-100 shadow-sm group-hover:scale-105 transition-transform">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{customer.name}</span>
                                                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                    <Mail size={12} /> {customer.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-black text-gray-700">{customer.totalOrders}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Orders</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                                            {formatCurrency(customer.totalSpent)}
                                        </span>
                                    </td>
                                    <td className="py-5 px-8">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 font-bold">
                                                {new Date(customer.memberSince).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">Joined</span>
                                        </div>
                                    </td>
                                    {/* <td className="py-5 px-8 text-right">
                                        <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCustomers.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                            <Users size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">No Customers Found</h3>
                        <p className="text-gray-400 font-medium mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}