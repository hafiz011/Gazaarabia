"use client";


import { useState, useEffect } from "react";
import {
    Star,
    ThumbsUp,
    Clock,
    CheckCircle,
    Eye,
    Heart,
    User,
    Package,
    X,
    Play,
    Pin
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { reviewService } from "@/lib/services/seller/reviewService";


interface Review {
    id: number;
    rating: number;
    comment: string;
    image: string;
    video: string;
    createdAt: string;
    updatedAt: string;
    isPinned: boolean;
    userId: number;
    productId: number;
    product: {
        id: number;
        title: string;
        slug: string;
        primaryImage: string;
    };
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function ReviewsPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    // Fetch reviews
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.SELLER.LOGIN);
        else if (session?.user?.token) {
            (async () => {
                try {
                    setLoading(true);
                    const data = await reviewService.getReviews(session.user.token);
                    setReviews(data || []);
                } catch (err) {
                    console.error("Failed to fetch reviews", err);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [status, session, router]);

    const handleTogglePin = async (id: number, currentPinned: boolean) => {
        if (!session?.user?.token) return;
        try {
            // Optimistic update
            setReviews(prev => {
                const updated = prev.map(r => r.id === id ? { ...r, isPinned: !currentPinned } : r);
                return updated.sort((a, b) => {
                    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
            });

            await reviewService.togglePin(id, !currentPinned, session.user.token);
        } catch (err) {
            console.error("Failed to toggle pin", err);
            // Revert on error
            const data = await reviewService.getReviews(session.user.token);
            setReviews(data || []);
        }
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0 
            ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 
            : 0
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--brand-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
                    <p className="text-gray-500">Manage feedback and build your store's reputation.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                            Last 30 Days
                        </span>
                    </div>
                </div>
            </div>

            {reviews.length > 0 ? (
                <>
                    {/* Summary Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Average Rating</h3>
                            <div className="text-6xl font-black text-gray-900 mb-4">{averageRating}</div>
                            <div className="flex items-center text-yellow-500 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={20} 
                                        fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} 
                                        className={i < Math.round(Number(averageRating)) ? "" : "text-gray-200"}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Based on {reviews.length} reviews</p>
                        </div>

                        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Rating Distribution</h3>
                            <div className="space-y-4">
                                {ratingDistribution.map((dist) => (
                                    <div key={dist.star} className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 w-12 text-sm font-bold text-gray-600">
                                            {dist.star} <Star size={14} fill="currentColor" className="text-yellow-500" />
                                        </div>
                                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-yellow-400 rounded-full transition-all duration-1000" 
                                                style={{ width: `${dist.percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-10 text-right text-xs font-bold text-gray-400">
                                            {dist.count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filters & Grid */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">All Reviews</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort by:</span>
                                <select className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none font-medium shadow-sm">
                                    <option>Most Recent</option>
                                    <option>Highest Rated</option>
                                    <option>Lowest Rated</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} onTogglePin={handleTogglePin} />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                /* Empty State */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-20 text-center flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-6">
                        <Star size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Reviews Yet</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        When customers review your products, they will appear here. Build trust by delivering great products and service!
                    </p>
                    <button 
                        onClick={() => router.push('/seller/products')}
                        className="bg-[var(--brand-primary)] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition"
                    >
                        Check My Products
                    </button>
                </div>
            )}
        </div>
    );
}

function ReviewCard({ review, onTogglePin }: { review: Review, onTogglePin: (id: number, current: boolean) => void }) {
    return (
        <div className={`bg-white rounded-3xl border ${review.isPinned ? 'border-blue-200 shadow-lg ring-1 ring-blue-50' : 'border-gray-100 shadow-sm'} overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative`}>
            {/* Pin Toggle */}
            <button 
                onClick={() => onTogglePin(review.id, review.isPinned)}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-all z-20 ${
                    review.isPinned 
                    ? 'bg-blue-500 text-white shadow-md rotate-12 scale-110' 
                    : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 border border-gray-100'
                }`}
                title={review.isPinned ? "Unpin Review" : "Pin Review to Top"}
            >
                <Pin size={18} fill={review.isPinned ? "currentColor" : "none"} />
            </button>

            <div className="p-8 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-[var(--brand-primary)] font-black text-lg border border-blue-100 shadow-sm">
                            {review.user.firstName.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900 leading-tight">
                                    {review.user.firstName} {review.user.lastName.charAt(0)}.
                                </h4>
                                {review.isPinned && (
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded uppercase tracking-wider">Pinned</span>
                                )}
                            </div>
                            <div className="flex items-center text-yellow-500 mt-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={14} 
                                        fill={i < review.rating ? "currentColor" : "none"} 
                                        className={i < review.rating ? "mr-0.5" : "text-gray-200 mr-0.5"}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-right pr-8">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                            {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                    </div>
                </div>

                {/* Comment */}
                <blockquote className="text-gray-600 mb-6 italic relative flex-1">
                    <span className="text-4xl text-gray-100 absolute -top-4 -left-2 select-none font-serif">"</span>
                    <p className="relative z-10 text-sm leading-relaxed line-clamp-4">
                        {review.comment}
                    </p>
                </blockquote>

                {/* Product Snapshot */}
                <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50/50 border border-gray-100 rounded-2xl group-hover:bg-white group-hover:border-blue-100 transition-colors">
                    <div
                        className="w-14 h-14 rounded-xl bg-gray-200 bg-cover bg-center shadow-sm"
                        style={{ backgroundImage: `url(${review.product.primaryImage})` }}
                    />
                    <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-gray-900 text-xs truncate">
                            {review.product.title}
                        </h5>
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-blue-500 uppercase">
                            <Package size={10} />
                            View Product
                        </div>
                    </div>
                </div>

                {/* Media (If exists) */}
                {(review.image || review.video) && (
                    <div className="flex gap-2 mb-6">
                        {review.image && (
                            <div
                                className="w-20 h-20 rounded-2xl bg-gray-200 bg-cover bg-center cursor-pointer ring-offset-2 hover:ring-2 hover:ring-blue-500 transition-all shadow-sm"
                                style={{ backgroundImage: `url(${review.image})` }}
                            />
                        )}
                        {review.video && (
                            <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors shadow-sm relative overflow-hidden group/vid">
                                <Play size={20} className="text-white relative z-10" />
                                <div className="absolute inset-0 bg-blue-500/20 group-hover/vid:bg-blue-500/0 transition-colors"></div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="pt-6 border-t border-gray-50 mt-auto">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 text-gray-500 text-xs font-bold hover:bg-[var(--brand-primary)] hover:text-white transition-all shadow-sm group-hover:shadow-md">
                        <Eye size={16} />
                        Full Review Details
                    </button>
                </div>
            </div>
        </div>
    );
}