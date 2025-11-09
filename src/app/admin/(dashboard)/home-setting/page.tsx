"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
    Box,
    Button,
    Typography,
    TextField,
    IconButton,
    FormControl,
} from "@mui/material";

import { Autocomplete } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

import PopupAlert from "@/components/PopupAlert";
import AlertMessage from "@/components/AlertMessage";

import { categoryService } from "@/lib/services/categoryService";
import { productService } from "@/lib/services/productService";
import { homePageService } from "@/lib/services/homePageSetting";
import { uploadService } from "@/lib/services/uploadService";
import { Close as CloseIcon } from "@mui/icons-material";


export default function HomePageSettings() {
    const { data: session } = useSession();
    const router = useRouter();
    const token = session?.user?.token;

    const [loading, setLoading] = useState(false);

    const [alert, setAlert] = useState({
        isOpen: false,
        type: "" as "success" | "error" | "",
        message: "",
    });

    const [popup, setPopup] = useState({
        isOpen: false,
        type: "" as "warning" | "",
        message: "",
    });

    const [heroSlides, setHeroSlides] = useState<{ desktop: string; mobile: string }[]>([]);
    const [midBanner, setMidBanner] = useState<string | null>(null);

    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [productList, setProductList] = useState<{ id: number; name: string }[]>([]);

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [signatureProducts, setSignatureProducts] = useState<number[]>([]);

    const [uploadingSlideIndex, setUploadingSlideIndex] = useState<number | null>(null);
    const [uploadingSlideType, setUploadingSlideType] = useState<"desktop" | "mobile" | null>(null);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [headerText, setHeaderText] = useState("");



    const bannerRef = useRef<HTMLInputElement>(null);

    const fieldStyle = {
        "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "var(--brand-secondary)" },
        "& .MuiInputLabel-root.Mui-focused": { color: "var(--brand-secondary)" }
    };

    // Fetch Categories + Products
    useEffect(() => {
        if (!token) return;

        (async () => {
            try {
                const catRes: any = await categoryService.getAll(token);
                setCategories((catRes.data || catRes).map((c: any) => ({
                    id: c.id,
                    name: c.name
                })));

                const productRes: any = await productService.getAll(token);
                setProductList((productRes.data || productRes).map((p: any) => ({
                    id: p.id,
                    name: p.title
                })));
            } catch (err: any) {
                setAlert({
                    isOpen: true,
                    type: "error",
                    message: err.message || "Failed to load data.",
                });
            }
        })();
    }, [token]);


    // Load saved homepage settings
    useEffect(() => {
        if (!token) return;

        (async () => {
            try {
                const res: any = await homePageService.get(token);
                const saved = res?.data;

                if (!saved) return;

                setHeaderText(saved.headerText || "");

                setHeroSlides(saved.heroSlides || []);
                setSelectedCategories(saved.shopByCategory || []);
                setMidBanner(saved.midBanner || null);
                setSignatureProducts(saved.signatureProducts || []);


            } catch (err: any) {
                setAlert({
                    isOpen: true,
                    type: "error",
                    message: err.message || "Failed to load homepage settings.",
                });
            }
        })();
    }, [token]);


    const handleSlideFile = async (e: any, idx: number, type: "desktop" | "mobile") => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingSlideIndex(idx);
            setUploadingSlideType(type);

            const uploadedUrl = await uploadService.uploadImage(file, "homepage/hero");

            setHeroSlides(prev => {
                const copy = [...prev];
                copy[idx][type] = uploadedUrl;
                return copy;
            });
        } catch (error: any) {
            setAlert({
                isOpen: true,
                type: "error",
                message: error.message || "Failed to upload image",
            });
        } finally {
            setUploadingSlideIndex(null);
            setUploadingSlideType(null);
        }
    };



    const handleBannerUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingBanner(true);
            const uploadedUrl = await uploadService.uploadImage(file, "homepage/banner");
            setMidBanner(uploadedUrl);
        } catch (error: any) {
            setAlert({
                isOpen: true,
                type: "error",
                message: error.message || "Failed to upload banner",
            });
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleSave = async () => {
        // Hero slider must not be empty
        if (heroSlides.length === 0) {
            setPopup({
                isOpen: true,
                type: "warning",
                message: "Please add at least one slide.",
            });
            return;
        }

        // Desktop & mobile must exist for every slide
        if (heroSlides.some(s => !s.desktop || !s.mobile)) {
            setPopup({
                isOpen: true,
                type: "warning",
                message: "Every slide must have both Desktop and Mobile images.",
            });
            return;
        }

        // Require at least one category
        if (selectedCategories.length === 0) {
            setPopup({
                isOpen: true,
                type: "warning",
                message: "Please select at least one category.",
            });
            return;
        }

        // Full width banner required
        if (!midBanner) {
            setPopup({
                isOpen: true,
                type: "warning",
                message: "Please upload the Full Width Banner.",
            });
            return;
        }

        // Signature products required
        if (signatureProducts.length === 0) {
            setPopup({
                isOpen: true,
                type: "warning",
                message: "Please select at least one signature product.",
            });
            return;
        }

        const payload = {
            heroSlides,
            shopByCategory: selectedCategories,
            midBanner,
            signatureProducts,
            headerText,
        };

        try {
            setLoading(true);
            await homePageService.update(token!, payload);

            setAlert({
                isOpen: true,
                type: "success",
                message: "Homepage Setting Saved Successfully!",
            });

        } catch (err: any) {
            setAlert({
                isOpen: true,
                type: "error",
                message: err.message || "Failed to save homepage.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="p-6 max-w-4xl mx-auto">

            {alert.isOpen && (
                <AlertMessage
                    type={alert.type as "success" | "error"}
                    message={alert.message}
                    onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
                />
            )}

            <Box className="bg-white p-6 rounded-xl shadow border border-[var(--soft-gray)] space-y-10">

                <Typography variant="h5" className="font-semibold text-[var(--text-primary)]">
                    Homepage Content Manager
                </Typography>



                <Box>
                    <TextField
                        label="Header Toolbar Text"
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        fullWidth
                        sx={fieldStyle}
                        placeholder="Example: Free Shipping on Orders Over $50"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                        This text will appear at the very top of your website header.
                    </p>
                </Box>

                {/* ================= HERO SLIDER ================= */}
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, borderBottom: "1px solid var(--soft-gray)", paddingBottom: "6px", marginBottom: "16px" }}>
                        Hero Slider
                    </Typography>

                    {heroSlides.map((slide, idx) => (
                        <Box key={idx} className="border border-[var(--soft-gray)] p-4 rounded-lg mb-4 space-y-4">

                            <Box className="flex items-center gap-6">

                                {/* Desktop */}
                                <Box className="relative">
                                    <Box className="w-40 h-24 rounded border border-[var(--mid-gray)] overflow-hidden cursor-pointer bg-gray-50 flex items-center justify-center"
                                        onClick={() => document.getElementById(`desktop-${idx}`)?.click()}>

                                        {uploadingSlideIndex === idx && uploadingSlideType === "desktop" ? (
                                            <span className="text-xs text-gray-400 animate-pulse">Uploading...</span>
                                        ) : slide.desktop ? (
                                            <img src={slide.desktop} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 text-xs">Desktop</span>
                                        )}

                                    </Box>

                                    <p className="text-[10px] text-gray-500 mt-1">Recommended: 1920 × 800 px</p>

                                    {slide.desktop && (
                                        <IconButton size="small" onClick={() => {
                                            const copy = [...heroSlides];
                                            copy[idx].desktop = "";
                                            setHeroSlides(copy);
                                        }}
                                            className="!absolute top-[-6px] right-[-6px]"
                                            sx={{ background: "var(--brand-primary)", color: "#fff", padding: "4px", "&:hover": { background: "var(--brand-secondary)" } }}>
                                            <CloseIcon sx={{ fontSize: "16px" }} />

                                        </IconButton>
                                    )}

                                    <input type="file" id={`desktop-${idx}`} className="hidden" accept="image/*" onChange={(e) => handleSlideFile(e, idx, "desktop")} />
                                </Box>

                                {/* Mobile */}
                                <Box className="relative">
                                    <Box className="w-28 h-32 rounded border border-[var(--mid-gray)] overflow-hidden cursor-pointer bg-gray-50 flex items-center justify-center"
                                        onClick={() => document.getElementById(`mobile-${idx}`)?.click()}>


                                        {uploadingSlideIndex === idx && uploadingSlideType === "mobile" ? (
                                            <span className="text-xs text-gray-400 animate-pulse">Uploading...</span>
                                        ) : slide.mobile ? (
                                            <img src={slide.mobile} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 text-xs">Mobile</span>
                                        )}

                                    </Box>

                                    <p className="text-[10px] text-gray-500 mt-1">Recommended: 750 × 1000 px</p>


                                    {slide.mobile && (
                                        <IconButton size="small" onClick={() => {
                                            const copy = [...heroSlides];
                                            copy[idx].mobile = "";
                                            setHeroSlides(copy);
                                        }}
                                            className="!absolute top-[-6px] right-[-6px]"
                                            sx={{ background: "var(--brand-primary)", color: "#fff", padding: "4px", "&:hover": { background: "var(--brand-secondary)" } }}>
                                            <CloseIcon sx={{ fontSize: "16px" }} />

                                        </IconButton>
                                    )}

                                    <input type="file" id={`mobile-${idx}`} className="hidden" accept="image/*" onChange={(e) => handleSlideFile(e, idx, "mobile")} />
                                </Box>

                                <IconButton onClick={() => setHeroSlides(heroSlides.filter((_, i) => i !== idx))}>
                                    <DeleteIcon sx={{ color: "var(--brand-primary)" }} />
                                </IconButton>

                            </Box>
                        </Box>
                    ))}

                    <Button variant="contained" onClick={() => setHeroSlides([...heroSlides, { desktop: "", mobile: "" }])}
                        sx={{ background: "var(--brand-primary)", "&:hover": { background: "var(--brand-secondary)" } }}>
                        Add Slide
                    </Button>
                </Box>

                {/* ================= SHOP BY CATEGORY ================= */}
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, borderBottom: "1px solid var(--soft-gray)", paddingBottom: "6px", marginBottom: "16px" }}>
                        Shop By Category
                    </Typography>

                    <FormControl fullWidth sx={fieldStyle}>
                        <Autocomplete
                            multiple
                            options={categories}
                            getOptionLabel={(o) => o.name}
                            value={categories.filter(c => selectedCategories.includes(c.id))}
                            onChange={(_, val) => setSelectedCategories(val.map(v => v.id))}
                            renderInput={(params) => <TextField {...params} label="Select Categories" />}
                        />
                    </FormControl>
                </Box>

                {/* ================= FULL WIDTH BANNER ================= */}
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, borderBottom: "1px solid var(--soft-gray)", paddingBottom: "6px", marginBottom: "16px" }}>
                        Full Width Banner
                    </Typography>

                    <Box className="relative w-full">
                        <Box className="w-full h-64 rounded-lg border border-[var(--mid-gray)] overflow-hidden cursor-pointer bg-gray-50 flex items-center justify-center"
                            onClick={() => bannerRef.current?.click()}>
                            {/* {midBanner ? <img src={midBanner} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-sm">Click to upload Banner</span>} */}


                            {uploadingBanner ? (
                                <span className="text-gray-400 text-sm animate-pulse">Uploading...</span>
                            ) : midBanner ? (
                                <img src={midBanner} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 text-sm">Click to upload Banner</span>
                            )}

                        </Box>

                        <p className="text-[11px] text-gray-500 mt-2 text-center">
                            Recommended Size: 1920 × 900 px
                        </p>


                        {midBanner && (
                            <IconButton size="small" onClick={() => setMidBanner(null)}
                                className="!absolute top-2 right-2"
                                sx={{ background: "var(--brand-primary)", color: "#fff", padding: "6px", "&:hover": { background: "var(--brand-secondary)" } }}>
                                <CloseIcon sx={{ fontSize: "16px" }} />

                            </IconButton>
                        )}
                    </Box>

                    <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                </Box>

                {/* ================= SIGNATURE PRODUCTS ================= */}
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, borderBottom: "1px solid var(--soft-gray)", paddingBottom: "6px", marginBottom: "16px" }}>
                        Signature Collection
                    </Typography>

                    <FormControl fullWidth sx={fieldStyle}>
                        <Autocomplete
                            multiple
                            options={productList}
                            getOptionLabel={(o) => o.name}
                            value={productList.filter(p => signatureProducts.includes(p.id))}
                            onChange={(_, val) => setSignatureProducts(val.map(v => v.id))}
                            renderInput={(params) => <TextField {...params} label="Select Products" />}
                        />
                    </FormControl>
                </Box>

                {/* ================= SAVE ================= */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button variant="outlined" onClick={() => router.push("/admin")}
                        sx={{ borderColor: "var(--mid-gray)" }}>
                        Cancel
                    </Button>

                    <Button variant="contained" disabled={loading}
                        onClick={handleSave}
                        sx={{ background: "var(--brand-primary)", "&:hover": { background: "var(--brand-secondary)" } }}>
                        {loading ? "Saving..." : "Save Homepage"}
                    </Button>
                </div>

            </Box>

            {popup.isOpen && (
                <PopupAlert
                    type={popup.type as any}
                    message={popup.message}
                    confirmText="OK"
                    onConfirm={() => setPopup((p) => ({ ...p, isOpen: false }))}
                    show={popup.isOpen}
                />
            )}

        </Box>
    );
}
