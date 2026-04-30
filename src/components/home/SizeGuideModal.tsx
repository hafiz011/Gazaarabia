"use client";

import React from "react";

export default function SizeGuideModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div
                className="relative my-8 w-full max-w-4xl rounded-xl bg-[var(--background)] text-[var(--text-primary)] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4"
                    style={{ borderColor: "rgba(0,0,0,0.08)", background: "var(--background)" }}
                >
                    <h2 className="text-lg md:text-xl font-semibold tracking-wide">
                        Size Guide
                    </h2>
                    <button
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                        aria-label="Close"
                        style={{ background: "transparent", color: "var(--text-secondary)" }}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-8 pt-4">

                    <p className="text-sm text-[var(--text-secondary)] mb-5">
                        We know the right fit matters. Use the size charts below to convert sizes and
                        check body/length measurements.
                    </p>

                    {/* WOMEN — Size Conversion */}
                    <Section title="Women's Clothing — Size Conversion">
                        <Table
                            headers={["", "XXS", "XS", "S", "M", "L", "XL", "XXL"]}
                            rows={[
                                // ["AAB Size", "-", "-", "S", "M", "L", "XL", "XXL"],
                                ["UK Size", "4-6", "6-8", "10-12", "14-16", "18-20", "22-24", "24-26"],
                                ["US Size", "0-2", "2-4", "6-8", "10-12", "14-16", "18-20", "20-22"],
                                ["EU Size", "32-34", "34-36", "38-40", "42-44", "46-48", "50-52", "52-54"],
                            ]}
                        />
                    </Section>

                    {/* WOMEN — Length Measurements */}
                    <Section title="Women's Length Measurements (Garment)">
                        <p className="text-xs text-[var(--text-secondary)] mb-2">
                            Measurements below help you choose the desired garment length.
                        </p>
                        <Table
                            headers={["Length (inches)", "52", "54", "56", "58", "60", "62"]}
                            rows={[
                                ["Recommended Height (ft/in)", "4'11\"-5'2\"", "5'2\"-5'4\"", "5'4\"-5'6\"", "5'6\"-5'8\"", "5'8\"-5'9\"", "5'9\"-6'2\""],
                                ["Recommended Height (cm)", "150-157", "157-163", "163-168", "168-173", "173-178", "178-188"],
                            ]}
                        />
                    </Section>

                    {/* WOMEN — Body Measurements */}
                    <Section title="Women's Body Measurements">
                        <p className="text-xs text-[var(--text-secondary)] mb-2">
                            Based on body measurements taken over light clothing.
                        </p>
                        <Table
                            headers={["Size", "XXS", "XS", "S", "M", "L", "XL", "XXL"]}
                            rows={[
                                ["Bust (inches)", "30-32", "32-34", "34-36", "36-40", "40-42", "42-44", "44-48"],
                                ["Bust (cm)", "76-81", "81-86", "86-91", "91-101", "101-109", "109-117", "117-122"],
                                ["Waist (inches)", "20-23", "23-26", "26-29", "29-32", "32-35", "35-39", "39-42"],
                                ["Hips (inches)", "32-34", "34-36", "36-38", "38-42", "42-45", "45-48", "48-50"],
                                ["Hips (cm)", "81-86", "86-91", "91-96", "96-100", "100-114", "114-122", "122-127"],
                            ]}
                        />
                    </Section>

                    {/* HOW TO MEASURE */}
                    <Section title="How to Measure">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                                <li><b>Length:</b> Measure from shoulder to hem.</li>
                                <li><b>Bust:</b> Measure around fullest chest.</li>
                                <li><b>Waist:</b> Measure at the narrowest point.</li>
                                <li><b>Hips:</b> Measure around the fullest part of hips.</li>
                            </ul>

                            {/* RESTORED SVG IMAGE */}
                            <div className="mx-auto w-full max-w-xs">
                                <svg viewBox="0 0 200 420" className="w-full h-auto">
                                    <path
                                        d="M100 30c18 0 26 14 26 26 0 10-2 18-4 24 10 10 18 20 18 36 0 22-10 38-10 56 0 12 8 24 10 34 2 10-2 22-8 32-4 7-6 15-6 22 0 12 4 26 4 38 0 20-14 34-30 34s-30-14-30-34c0-12 4-26 4-38 0-7-2-15-6-22-6-10-10-22-8-32 2-10 10-22 10-34 0-18-10-34-10-56 0-16 8-26 18-36-2-6-4-14-4-24 0-12 8-26 26-26z"
                                        fill="rgba(0,0,0,0.06)"
                                        stroke="var(--mid-gray)"
                                    />
                                    <line x1="20" y1="150" x2="180" y2="150" stroke="var(--brand-primary)" strokeDasharray="4 4" />
                                    <text x="10" y="145" fontSize="10" fill="var(--text-secondary)">Bust</text>
                                    <line x1="20" y1="200" x2="180" y2="200" stroke="var(--brand-primary)" strokeDasharray="4 4" />
                                    <text x="10" y="195" fontSize="10" fill="var(--text-secondary)">Waist</text>
                                    <line x1="20" y1="250" x2="180" y2="250" stroke="var(--brand-primary)" strokeDasharray="4 4" />
                                    <text x="10" y="245" fontSize="10" fill="var(--text-secondary)">Hips</text>
                                    <line x1="160" y1="70" x2="160" y2="380" stroke="var(--brand-secondary)" />
                                    <polygon points="160,60 155,72 165,72" fill="var(--brand-secondary)" />
                                    <polygon points="160,390 155,378 165,378" fill="var(--brand-secondary)" />
                                    <text x="140" y="50" fontSize="10" fill="var(--text-secondary)">Length</text>
                                </svg>
                            </div>
                        </div>
                    </Section>

                    <div className="mt-6 rounded-lg border p-3 text-xs"
                        style={{ borderColor: "var(--soft-gray)", background: "var(--white)" }}>
                        Garment measurements are approximate.
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-8">
            <h3
                className="mb-3 inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold"
                style={{
                    background: "var(--soft-gray)",
                    color: "var(--navy-blue)",
                    border: "1px solid var(--mid-gray)",
                }}
            >
                {title}
            </h3>
            {children}
        </section>
    );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {

    const headerCells = headers.map((h, i) => (
        <th
            key={i}
            className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold"
            style={{
                background: "var(--light-blue)",
                color: "var(--navy-blue)",
                borderBottom: "1px solid var(--soft-gray)",
            }}
        >
            {h}
        </th>
    ));

    const rowCells = rows.map((r, idx) => (
        <tr key={idx} className="even:bg-[rgba(0,0,0,0.02)]">
            {r.map((cell, j) => (
                <td
                    key={j}
                    className="whitespace-nowrap px-3 py-2 text-sm"
                    style={{ borderBottom: "1px solid var(--soft-gray)" }}
                >
                    {cell}
                </td>
            ))}
        </tr>
    ));

    return (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--soft-gray)" }}>
            <table className="min-w-full border-collapse">
                <thead><tr>{headerCells}</tr></thead>
                <tbody>{rowCells}</tbody>
            </table>
        </div>
    );
}
