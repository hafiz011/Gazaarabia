"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import { solidarityReceiptPublicService } from "@/lib/services/solidarityReceiptPublicService";

export default function PublicSolidarityReceiptsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const ITEMS_PER_PAGE = 12;

    const [currentPage, setCurrentPage] = useState(
        Number(searchParams.get("page")) || 1
    );
    const [totalPages, setTotalPages] = useState(1);

    const [allReceipts, setAllReceipts] = useState<any[]>([]);
    const [visibleReceipts, setVisibleReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [zoomImage, setZoomImage] = useState<string | null>(null);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            setLoading(true);

            const res: any = await solidarityReceiptPublicService.getAll();

            const list = res?.data ?? [];
            setAllReceipts(list);

            const pages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
            setTotalPages(pages);

            paginate(list, currentPage);
        } catch (err) {
            console.error("Failed to load receipts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        paginate(allReceipts, currentPage);

        router.push(`?page=${currentPage}`, { scroll: false });
    }, [currentPage, allReceipts]);

    const paginate = (list: any[], page: number) => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        setVisibleReceipts(list.slice(start, end));
    };

    if (loading) return <Loader />;

    return (
        <div className="relative min-h-screen bg-[var(--soft-gray)] py-16 px-4 mt-10 overflow-hidden">

            {/* BG Decorations */}
            <div className="absolute top-0 left-0 w-[35rem] h-[35rem] bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

            <div className="relative z-10 max-w-7xl mx-auto">

                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-[var(--brand-primary)]">
                        Our Solidarity Certificates
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2 max-w-2xl mx-auto">
                        A showcase of our verified contributions and humanitarian efforts.
                    </p>
                </div>

                {/* No Data */}
                {visibleReceipts.length === 0 ? (
                    <p className="text-center text-[var(--text-muted)]">
                        No certificates available.
                    </p>
                ) : (
                    <>
                        {/* Grid */}
                        <div
                            className={`
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                md:grid-cols-3
                                lg:grid-cols-4
                                gap-6
                                mb-10
                            `}
                        >
                            {visibleReceipts.map((item) => (
                                <div
                                    key={item.id}
                                    className={`
                                        bg-white
                                        rounded-xl
                                        shadow
                                        border
                                        border-[var(--mid-gray)]
                                        hover:shadow-lg
                                        hover:border-[var(--brand-primary)]
                                        transition
                                        cursor-pointer
                                        p-4
                                    `}
                                    onClick={() => setZoomImage(item.receiptImage)}
                                >
                                    <div className="w-full h-72 flex items-center justify-center bg-white">
                                        <img
                                            src={item.receiptImage}
                                            alt="Solidarity Certificate"
                                            loading="lazy"
                                            className={`
                                                max-w-full
                                                max-h-full
                                                object-contain
                                                transition-opacity
                                                duration-700
                                            `}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Zoom Modal */}
            {zoomImage && (
                <div
                    className={`
                        fixed inset-0
                        bg-black/80
                        backdrop-blur-sm
                        flex
                        items-center
                        justify-center
                        z-50
                        p-4
                        animate-fadeIn
                    `}
                    onClick={() => setZoomImage(null)}
                >
                    <img
                        src={zoomImage}
                        alt="Zoomed Certificate"
                        className={`
                            max-w-[90%]
                            max-h-[90%]
                            rounded-xl
                            shadow-2xl
                            border
                            border-gray-300
                            animate-zoomIn
                        `}
                    />
                </div>
            )}

            {/* Animations */}
            <style jsx>{`
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-zoomIn {
                    animation: zoomIn 0.25s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes zoomIn {
                    0% { transform: scale(0.7); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
