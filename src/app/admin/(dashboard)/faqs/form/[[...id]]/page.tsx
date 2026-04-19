"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import PopupAlert from "@/components/PopupAlert";
import AlertMessage from "@/components/AlertMessage";
import RichTextEditor from "@/components/RichTextEditor";
import { faqService } from "@/lib/services/faqService";
import { faqCategoryService, FaqCategory } from "@/lib/services/faqCategoryService";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function AddOrEditFaqPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const faqId = params?.id;

  const [form, setForm] = useState({
    question: "",
    answer: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | ""; message: string }>({
    isOpen: false,
    type: "",
    message: "",
  });

  const [popup, setPopup] = useState<{ isOpen: boolean; type: "success" | "error" | "warning" | ""; message: string }>({
    isOpen: false,
    type: "",
    message: "",
  });

  //  Match Blog Page field colors and border style
  const fieldStyle = {
    "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "var(--brand-secondary)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "var(--brand-secondary)" },
  };

  //  Redirect unauthorized users
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.ADMIN.LOGIN);
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace(ROUTES.HOME);
    }
  }, [status, session, router]);

  //  Fetch FAQ Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data: any = await faqCategoryService.getAll(session?.user?.token as string);
        setCategories(data?.data ?? []);
      } catch (err: any) {
        setAlert({
          isOpen: true,
          type: "error",
          message: err.message || "Failed to load FAQ categories.",
        });
      }
    };
    if (session?.user?.token) fetchCategories();
  }, [session?.user?.token]);

  //  Fetch FAQ if editing
  useEffect(() => {
    if (!faqId || !session?.user?.token) return;
    const fetchFaq = async () => {
      try {
        const res: any = await faqService.getById(session?.user?.token as string, Number(faqId));
        const data = res?.data ?? null;
        setForm({
          question: data.question,
          answer: data.answer,
          categoryId: String(data.categoryId),
        });
      } catch (err: any) {
        setAlert({
          isOpen: true,
          type: "error",
          message: err.message || "Failed to load FAQ details.",
        });
      }
    };
    fetchFaq();
  }, [faqId, session?.user?.token]);

  //  Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  //  Handle answer change for ReactQuill
  const handleAnswerChange = (value: string) => {
    setForm((prev) => ({ ...prev, answer: value }));
  };

  //  Submit form (Add / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.question.trim() || !form.answer.trim()) {
      setPopup({ isOpen: true, type: "warning", message: "Please fill all required fields." });
      return;
    }
    if (!form.categoryId) {
      setPopup({ isOpen: true, type: "warning", message: "Please select a category." });
      return;
    }

    try {
      setLoading(true);
      const token = session?.user?.token as string;

      if (faqId) {
        await faqService.update(token, Number(faqId), {
          question: form.question,
          answer: form.answer,
          categoryId: Number(form.categoryId),
        });
        setAlert({ isOpen: true, type: "success", message: "FAQ updated successfully!" });
      } else {
        await faqService.create(token, {
          question: form.question,
          answer: form.answer,
          categoryId: Number(form.categoryId),
        });
        setAlert({ isOpen: true, type: "success", message: "FAQ added successfully!" });
      }

      setTimeout(() => router.push("/admin/faqs"), 1200);
    } catch (err: any) {
      setAlert({ isOpen: true, type: "error", message: err.message || "Failed to save FAQ." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-6 max-w-4xl mx-auto">
      {/* Alerts */}
      {alert.isOpen && (alert.type === "success" || alert.type === "error") && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Box className="bg-white p-6 rounded-xl shadow border border-[var(--soft-gray)]">
          <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {faqId ? "Update FAQ" : "Add FAQ"}
            </h2>
          </div>

          <div className="space-y-4">
            <TextField
              label="Question"
              required
              name="question"
              value={form.question}
              onChange={handleChange}
              fullWidth
              sx={fieldStyle}
            />

            <RichTextEditor
              value={form.answer}
              onChange={handleAnswerChange}
              label="Answer"
              required
              minHeight={300}
              placeholder="Write your answer here..."
            />

            <FormControl fullWidth required sx={fieldStyle}>
              <InputLabel id="category-select-label">FAQ Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={form.categoryId}
                label="FAQ Category"
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No categories found</MenuItem>
                )}
              </Select>
            </FormControl>

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button
                variant="outlined"
                onClick={() => router.push("/admin/faqs")}
                sx={{
                  color: "var(--text-primary)",
                  borderColor: "var(--mid-gray)",
                  "&:hover": { borderColor: "var(--text-primary)" },
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                sx={{
                  background: "var(--brand-primary)",
                  "&:hover": { background: "#c32230" },
                }}
                type="submit"
                disabled={loading}
              >
                {faqId ? "Update FAQ" : "Add FAQ"}
              </Button>
            </div>
          </div>
        </Box>
      </form>

      {popup.isOpen && popup.type && (
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
