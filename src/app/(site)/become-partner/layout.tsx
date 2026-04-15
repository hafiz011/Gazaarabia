import type { Metadata } from "next";

const domain = process.env.NEXT_PUBLIC_BASE_URL!;
const pageUrl = `${domain}/become-partner`;
const ogImage = `${domain}/images/partner-banner.png`;

export const metadata: Metadata = {
    title: "Become a Partner | Affiliate & Ambassador Program | GazaArabia",
    description:
        "Earn up to 10-15% per sale as an Affiliate or become an Ambassador to earn recurring revenue + creative rewards. Join the GazaArabia Partner Program today.",
    keywords: [
        "become a ambassador",
        "GazaArabia partner program",
        "affiliate program",
        "ambassador program",
        "earn commission online",
        "digital products affiliate",
        "recurring revenue program",
    ],
    openGraph: {
        title: "Become a Partner | Affiliate & Ambassador Program | GazaArabia",
        description:
            "Choose Affiliate (earn 10-15% per sale) or Ambassador (recurring revenue + creative rewards). Start earning today.",
        url: pageUrl,
        siteName: "GazaArabia",
        type: "website",
        images: [
            {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: "GazaArabia Partner Program",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Become a Partner | Affiliate & Ambassador Program",
        description:
            "Earn 10-15% per sale as an Affiliate or become an Ambassador for recurring revenue and creative bonuses.",
        images: [ogImage],
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
