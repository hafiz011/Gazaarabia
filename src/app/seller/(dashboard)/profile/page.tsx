"use client";

import { useState, useEffect } from "react";
import {
    User,
    Store,
    Mail,
    Phone,
    Star,
    ShoppingBag,
    Package,
    DollarSign,
    Pencil,
    Save,
    X,
    CheckCircle,
    AlertCircle,
    Camera,
    TrendingUp,
    Wallet,
    Clock,
    UploadCloud,
    Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { profileService } from "@/lib/services/seller/profileService";
import Loader from "@/components/Loader";
import { ROUTES } from "@/constants/routes";

interface SellerProfile {
    seller: {
        id: number;
        shopName: string | null;
        shopSlug: string | null;
        logo: string | null;
        banner: string | null;
        isActive: boolean;
        status: string;
        commissionValue: number;
        payoutDays: number;
        minimumPayout: number;
        availableBalance: number;
        pendingBalance: number;
        totalEarned: number;
        createdAt: string;
        user: { id: number; name: string; email: string; phone: string | null };
    };
    stats: {
        totalProducts: number;
        totalOrders: number;
        totalEarned: number;
        totalReviews: number;
        averageRating: number;
    };
}

/* ============================================================
   Re-usable Image Upload Field Component
   ============================================================ */
interface ImageUploadFieldProps {
    value: string;
    onChange: (url: string) => void;
    folder: string;
    token: string;
    editing: boolean;
    aspect: "square" | "banner";
    placeholder: string;
}

function ImageUploadField({ value, onChange, folder, token, editing, aspect, placeholder }: ImageUploadFieldProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`/api/upload?folder=${folder}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (data.url) onChange(data.url);
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    const isSquare = aspect === "square";
    const containerClass = isSquare
        ? "w-full aspect-square max-w-[140px]"
        : "w-full h-[110px]";

    if (!editing) {
        return (
            <div className={`${containerClass} rounded-2xl overflow-hidden bg-gray-50 border border-gray-100`}>
                {value ? (
                    <img src={value} alt="preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-300">
                        <Camera size={22} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Not set</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <label
            className={`relative ${containerClass} rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${dragOver
                ? "border-blue-400 bg-blue-50"
                : "border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        >
            <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {uploading ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-blue-500">
                    <Loader2 size={22} className="animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Uploading...</span>
                </div>
            ) : value ? (
                <>
                    <img src={value} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                        <UploadCloud size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Change</span>
                    </div>
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                    <UploadCloud size={22} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{placeholder}</span>
                    <span className="text-[9px] text-gray-300">Click or drag & drop</span>
                </div>
            )}
        </label>
    );
}

export default function SellerProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [profile, setProfile] = useState<SellerProfile | null>(null);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        shopName: "",
        shopSlug: "",
        logo: "",
        banner: "",
    });

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.SELLER.LOGIN);
        else if (session?.user?.token) {
            (async () => {
                try {
                    setLoading(true);
                    const data = await profileService.getProfile(session.user.token);
                    setProfile(data);
                    setForm({
                        name: data.seller.user.name || "",
                        phone: data.seller.user.phone || "",
                        shopName: data.seller.shopName || "",
                        shopSlug: data.seller.shopSlug || "",
                        logo: data.seller.logo || "",
                        banner: data.seller.banner || "",
                    });
                } catch (err) {
                    console.error("Failed to fetch profile", err);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [status, session, router]);

    const handleSave = async () => {
        if (!session?.user?.token) return;
        try {
            setSaving(true);
            await profileService.updateProfile(form, session.user.token);
            setToast({ type: "success", message: "Profile updated successfully!" });
            setEditing(false);
            // Refresh profile data
            const updated = await profileService.getProfile(session.user.token);
            setProfile(updated);
        } catch {
            setToast({ type: "error", message: "Failed to update profile. Please try again." });
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 4000);
        }
    };

    const handleCancel = () => {
        if (!profile) return;
        setForm({
            name: profile.seller.user.name || "",
            phone: profile.seller.user.phone || "",
            shopName: profile.seller.shopName || "",
            shopSlug: profile.seller.shopSlug || "",
            logo: profile.seller.logo || "",
            banner: profile.seller.banner || "",
        });
        setEditing(false);
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);

    if (loading) return <Loader />;
    if (!profile) return null;

    const { seller, stats } = profile;



    return (
        <div className="space-y-8 pb-12">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold transition-all duration-300 ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
                    {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.message}
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Store Profile</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage your seller account and store settings.</p>
                </div>
                <div className="flex items-center gap-3">
                    {editing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                <X size={16} /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-[var(--brand-primary)] px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 bg-[var(--brand-primary)] px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:opacity-90 transition-all"
                        >
                            <Pencil size={16} /> Edit Profile
                        </button>
                    )}
                </div>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Store Card */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Store Banner + Logo */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="relative h-32 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                            {seller.banner && (
                                <img src={seller.banner} alt="Banner" className="w-full h-full object-cover opacity-70" />
                            )}
                            {editing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                    <Camera size={24} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="px-6 pb-6 -mt-8">
                            <div className="relative w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden mb-4">
                                {seller.logo ? (
                                    <img src={seller.logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-2xl font-black text-blue-600">
                                        {(seller.shopName || seller.user.name || "S").charAt(0)}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-xl font-black text-gray-900">{seller.shopName || seller.user.name}</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">/{seller.shopSlug || "no-slug"}</p>

                            <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${seller.isActive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${seller.isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                                {seller.status}
                            </div>

                            <div className="mt-5 pt-5 border-t border-gray-50 space-y-3">
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                    <Star size={13} className="text-amber-500 fill-amber-400" />
                                    <span className="font-black text-gray-900">{stats.averageRating}</span> avg. rating
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                    <Clock size={13} />
                                    Member since {new Date(seller.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                    <DollarSign size={13} />
                                    Commission: <span className="font-bold text-gray-700">{seller.commissionValue}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Balance Card */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-4">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Wallet</h4>
                        {[
                            { label: "Available", value: seller.availableBalance, icon: Wallet, color: "emerald" },
                            { label: "Pending", value: seller.pendingBalance, icon: Clock, color: "amber" },
                            { label: "Total Earned", value: seller.totalEarned, icon: TrendingUp, color: "blue" },
                        ].map((b, i) => (
                            <div key={i} className={`flex items-center justify-between bg-${b.color}-50/50 px-4 py-3 rounded-2xl border border-${b.color}-50`}>
                                <div className="flex items-center gap-2">
                                    <b.icon size={14} className={`text-${b.color}-500`} />
                                    <span className={`text-[11px] font-black text-${b.color}-900 uppercase tracking-wider`}>{b.label}</span>
                                </div>
                                <span className={`text-sm font-black text-${b.color}-600`}>{formatCurrency(b.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Editable Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                        <h3 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
                            <User size={18} className="text-[var(--brand-primary)]" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                                {editing ? (
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                    />
                                ) : (
                                    <p className="text-sm font-bold text-gray-900 bg-gray-50 px-5 py-3.5 rounded-2xl">{seller.user.name}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                <p className="text-sm font-bold text-gray-500 bg-gray-50 px-5 py-3.5 rounded-2xl flex items-center gap-2">
                                    <Mail size={14} /> {seller.user.email}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                                {editing ? (
                                    <input
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        placeholder="e.g. +44 7700 900000"
                                    />
                                ) : (
                                    <p className="text-sm font-bold text-gray-900 bg-gray-50 px-5 py-3.5 rounded-2xl flex items-center gap-2">
                                        <Phone size={14} /> {seller.user.phone || "Not set"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Store Settings */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                        <h3 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Store size={18} className="text-[var(--brand-primary)]" />
                            Store Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                            {[
                                { key: "shopName", label: "Shop Name", placeholder: "My Awesome Store" },
                                { key: "shopSlug", label: "Shop Slug (URL)", placeholder: "my-awesome-store" },
                            ].map((field) => (
                                <div key={field.key} className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{field.label}</label>
                                    {editing ? (
                                        <input
                                            value={(form as any)[field.key]}
                                            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                            placeholder={field.placeholder}
                                            className="border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-gray-900 bg-gray-50 px-5 py-3.5 rounded-2xl truncate">
                                            {(seller as any)[field.key] || <span className="text-gray-300 font-medium">Not set</span>}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Image Upload: Logo & Banner */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Logo Upload */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Store Logo</label>
                                <ImageUploadField
                                    value={form.logo}
                                    onChange={(url) => setForm({ ...form, logo: url })}
                                    folder="seller-logos"
                                    token={session?.user?.token || ""}
                                    editing={editing}
                                    aspect="square"
                                    placeholder="Upload Logo"
                                />
                            </div>
                            {/* Banner Upload */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Store Banner</label>
                                <ImageUploadField
                                    value={form.banner}
                                    onChange={(url) => setForm({ ...form, banner: url })}
                                    folder="seller-banners"
                                    token={session?.user?.token || ""}
                                    editing={editing}
                                    aspect="banner"
                                    placeholder="Upload Banner"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payout Config (Read-only) */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                        <h3 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
                            <DollarSign size={18} className="text-[var(--brand-primary)]" />
                            Payout Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {[
                                { label: "Commission Rate", value: `${seller.commissionValue}%` },
                                { label: "Payout Period", value: `${seller.payoutDays} days` },
                                { label: "Minimum Payout", value: formatCurrency(seller.minimumPayout) },
                            ].map((item, i) => (
                                <div key={i} className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-xl font-black text-gray-900 mt-2">{item.value}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Admin-controlled</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
