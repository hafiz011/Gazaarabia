"use client";

import { useState } from "react";

interface Props {
    brands: any[];
    categories: any[];
    subcategories: any[];
    onChange: (filters: any) => void;
}

export default function ProductFilters({
    brands,
    categories,
    subcategories,
    onChange,
}: Props) {
    const [filters, setFilters] = useState({
        brandIds: [] as number[],
        categoryId: "",
        subcategoryId: "",
        minPrice: "",
        maxPrice: "",
        status: "",
        fromDate: "",
        toDate: "",
        sortBy: "",
    });

    const updateFilters = (key: string, value: any) => {
        const updated = { ...filters, [key]: value };
        setFilters(updated);
        onChange(updated);
    };

    const resetFilters = () => {
        const empty = {
            brandIds: [] as number[],
            categoryId: "",
            subcategoryId: "",
            minPrice: "",
            maxPrice: "",
            status: "",
            fromDate: "",
            toDate: "",
            sortBy: "",
        };
        setFilters(empty);
        onChange(empty);
    };

    const getLabel = (key: string, value: any) => {
        switch (key) {
            case "brandIds":
                return value
                    .map((id: number) => brands.find((b: any) => b.id === id)?.name)
                    .filter(Boolean)
                    .join(", ");

            case "categoryId":
                return categories.find((c: any) => c.id === Number(value))?.name;

            case "subcategoryId":
                return subcategories.find((s: any) => s.id === Number(value))?.name;

            case "status":
                return value === "active" ? "Active" : "Inactive";

            case "minPrice":
                return `Min £${value}`;

            case "maxPrice":
                return `Max £${value}`;

            case "fromDate":
                return `From ${value}`;

            case "toDate":
                return `To ${value}`;

            case "sortBy":
                const map: any = {
                    price_low_high: "Price: Low → High",
                    price_high_low: "Price: High → Low",
                    newest: "Newest",
                    oldest: "Oldest",
                };
                return map[value] || value;

            default:
                return value;
        }
    };

    const getKeyLabel = (key: string) => {
        const map: any = {
            brandIds: "Brand",
            categoryId: "Category",
            subcategoryId: "Subcategory",
            status: "Status",
            minPrice: "Price",
            maxPrice: "Price",
            fromDate: "Date",
            toDate: "Date",
            sortBy: "Sort",
        };

        return map[key] || key;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-5">

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-sm font-semibold text-gray-800">Filters</h2>
                    <p className="text-xs text-gray-500">Refine your product results</p>
                </div>

                <button
                    onClick={resetFilters}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                    Reset All
                </button>
            </div>

            {/* ================= PRIMARY FILTERS ================= */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">

                {/* BRAND */}
                <div>
                    <label className="text-xs font-medium text-gray-500">Brand</label>
                    <select
                        className="w-full mt-1 h-9 border border-gray-300 rounded-lg px-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) =>
                            updateFilters(
                                "brandIds",
                                e.target.value ? [Number(e.target.value)] : []
                            )
                        }
                    >
                        <option value="">All Brands</option>
                        {brands.map((b: any) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* CATEGORY */}
                <div>
                    <label className="text-xs font-medium text-gray-500">Category</label>
                    <select
                        className="w-full mt-1 h-9 border border-gray-300 rounded-lg px-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={filters.categoryId}
                        // onChange={(e) => updateFilters("categoryId", e.target.value)}
                        onChange={(e) => {
                            const value = e.target.value;

                            const updated = {
                                ...filters,
                                categoryId: value,
                                subcategoryId: "",
                            };

                            setFilters(updated);
                            onChange(updated);
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((c: any) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* SUBCATEGORY */}
                <div>
                    <label className="text-xs font-medium text-gray-500">Subcategory</label>
                    <select
                        disabled={!filters.categoryId}
                        className="w-full mt-1 h-9 border border-gray-300 rounded-lg px-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={filters.subcategoryId}
                        onChange={(e) => updateFilters("subcategoryId", e.target.value)}
                    >
                        <option value="">All Subcategories</option>
                        {subcategories.map((s: any) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* STATUS */}
                {/* <div>
                    <label className="text-xs font-medium text-gray-500">Status</label>
                    <select
                        className="w-full mt-1 h-9 border border-gray-300 rounded-lg px-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={filters.status}
                        onChange={(e) => updateFilters("status", e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div> */}

                {/* SORT */}
                <div>
                    <label className="text-xs font-medium text-gray-500">Sort By</label>
                    <select
                        className="w-full mt-1 h-9 border border-gray-300 rounded-lg px-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={filters.sortBy}
                        onChange={(e) => updateFilters("sortBy", e.target.value)}
                    >
                        <option value="">Default</option>
                        <option value="price_low_high">Price: Low → High</option>
                        <option value="price_high_low">Price: High → Low</option>
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>

            </div>

            {/* ================= SECONDARY FILTERS ================= */}
            <div className="flex flex-wrap items-end gap-4 border-t pt-4">

                {/* PRICE */}
                <div>
                    <label className="text-xs font-medium text-gray-500">Price Range</label>
                    <div className="flex gap-2 mt-1">
                        <input
                            type="number"
                            placeholder="Min"
                            className="h-9 w-24 border border-gray-300 rounded-lg px-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.minPrice}
                            onChange={(e) => updateFilters("minPrice", e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            className="h-9 w-24 border border-gray-300 rounded-lg px-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.maxPrice}
                            onChange={(e) => updateFilters("maxPrice", e.target.value)}
                        />
                    </div>
                </div>

                {/* DATE RANGE */}
                <div>
                    <label className="text-xs font-medium text-gray-500">Date Range</label>
                    <div className="flex gap-2 mt-1">
                        <input
                            type="date"
                            className="h-9 border border-gray-300 rounded-lg px-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.fromDate}
                            onChange={(e) => updateFilters("fromDate", e.target.value)}
                        />
                        <input
                            type="date"
                            className="h-9 border border-gray-300 rounded-lg px-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filters.toDate}
                            onChange={(e) => updateFilters("toDate", e.target.value)}
                        />
                    </div>
                </div>

            </div>

            {/* ================= ACTIVE FILTER CHIPS ================= */}
            <div className="flex flex-wrap gap-2 pt-3 border-t">

                {Object.entries(filters).map(([key, value]) => {
                    if (!value || value.length === 0) return null;

                    return (
                        <div
                            key={key}
                            // className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium"

                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
  ${key === "status"
                                    ? value === "active"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}

                        >
                            <span className="text-gray-600">
                                {getKeyLabel(key)}:
                            </span>

                            <span className="font-medium">
                                {getLabel(key, value)}
                            </span>
                            <button
                                onClick={() =>
                                    updateFilters(key, Array.isArray(value) ? [] : "")
                                }
                                className="text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}