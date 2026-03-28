"use client";

import { useEffect, useState } from "react";
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { submenuService } from "@/lib/services/submenuService";
import { menuService } from "@/lib/services/menuService";
import { categoryService } from "@/lib/services/categoryService";
import { subcategoryService } from "@/lib/services/subcategoryService";
import { blogCategoryService } from "@/lib/services/blogCategoryService";
import { useSession } from "next-auth/react";
import AlertMessage from "@/components/AlertMessage";
import { generateSlug } from "@/lib/utils";

export default function SubmenusFormPage() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const router = useRouter();
  const params = useParams();
  const submenuId = params?.id ? Number(params.id) : null;

  // ======= STATES =======
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [blogCategories, setBlogCategories] = useState<any[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    name: "",
    slug: "",
    menuId: "",
    categoryId: "",
    leftSubcategories: [],
    rightSubcategories: [],
    leftCustomLinks: [],
    rightCustomLinks: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<any>({ isOpen: false });
  const [loading, setLoading] = useState(true);

  const [isSlugEdited, setIsSlugEdited] = useState(false);


  // ======= LOAD DATA =======
  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const [menusRes, catsRes, subsRes, blogRes]: any = await Promise.all([
        menuService.getAll(token),
        categoryService.getAll(token!),
        subcategoryService.getAll(token!),
        blogCategoryService.getAll(token!),
      ]);

      setMenus(menusRes.data || []);
      setCategories(catsRes.data || []);
      setSubcategories(subsRes.data || []);
      setBlogCategories(blogRes.data || []);

      if (submenuId) {
        const submenuRes: any = await submenuService.getById(token!, submenuId);
        if (submenuRes?.data) {
          const sm = submenuRes.data;
          setForm({
            name: sm.name || "",
            slug: sm.slug || "",
            menuId: sm.menuId || "",
            categoryId: sm.categoryId || "",
            leftSubcategories: sm.leftSubcategories || [],
            rightSubcategories: sm.rightSubcategories || [],
            leftCustomLinks: sm.leftCustomLinks || [],
            rightCustomLinks: sm.rightCustomLinks || [],
          });
          setIsSlugEdited(true);
        }
      }
    } catch (err) {
      console.error("Error loading submenu form data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ======= SUBCATEGORY FILTER =======
  useEffect(() => {
    if (form.categoryId) {
      const filtered = subcategories.filter(
        (s) => s.categoryId === Number(form.categoryId)
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [form.categoryId, subcategories]);

  // ======= HANDLERS =======
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const selectedMenu = menus.find((m) => m.id === Number(form.menuId));

  const handleAddCustomLink = (side: "left" | "right") => {
    const field = side === "left" ? "leftCustomLinks" : "rightCustomLinks";
    setForm({
      ...form,
      [field]: [...form[field], { name: "", slug: "" }],
    });
  };

  const handleCustomLinkChange = (
    side: "left" | "right",
    index: number,
    key: string,
    value: string
  ) => {
    const field = side === "left" ? "leftCustomLinks" : "rightCustomLinks";
    const updated = [...form[field]];
    updated[index][key] = value;

    // ---- AUTO SLUG FOR CUSTOM LINKS ----
    if (key === "name") {
      updated[index].slug = generateSlug(value);
    }

    if (key === "slug") {
      updated[index].slug = generateSlug(value);
    }

    setForm({ ...form, [field]: updated });
  };

  const handleRemoveCustomLink = (side: "left" | "right", index: number) => {
    const field = side === "left" ? "leftCustomLinks" : "rightCustomLinks";
    const updated = form[field].filter((_: any, i: number) => i !== index);
    setForm({ ...form, [field]: updated });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.menuId) {
      setAlert({
        isOpen: true,
        type: "warning",
        message: "Please select a parent menu",
      });
      return;
    }

    // ---- SLUG VALIDATION ----
    const slug = form.slug?.trim();

    if (!slug) {
      return setAlert({
        isOpen: true,
        type: "error",
        message: "Slug is required.",
      });
    }

    if (slug.length < 3 || slug.length > 100) {
      return setAlert({
        isOpen: true,
        type: "error",
        message: "Slug must be between 3 and 100 characters.",
      });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return setAlert({
        isOpen: true,
        type: "error",
        message:
          "Slug can only contain lowercase letters, numbers and hyphens.",
      });
    }


    try {
      setSubmitting(true);
      if (submenuId) {
        await submenuService.update(token!, submenuId, form);
        setAlert({
          isOpen: true,
          type: "success",
          message: "Submenu updated successfully!",
        });
      } else {
        await submenuService.create(token!, form);
        setAlert({
          isOpen: true,
          type: "success",
          message: "Submenu created successfully!",
        });
        setForm({
          name: "",
          slug: "",
          menuId: "",
          categoryId: "",
          leftSubcategories: [],
          rightSubcategories: [],
          leftCustomLinks: [],
          rightCustomLinks: [],
        });
        setIsSlugEdited(false);

      }
      setTimeout(() => router.push("/admin/submenus"), 1200);
    } catch (err: any) {
      setAlert({ isOpen: true, type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ======= RENDER =======
  if (loading)
    return (
      <Box className="p-8 text-center text-gray-600">
        Loading submenu data...
      </Box>
    );

  return (
    <Box className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow">
      <Typography variant="h5" className="font-semibold mb-4">
        {submenuId ? "Edit Submenu" : "Add Submenu"}
      </Typography>

      {alert.isOpen && (
        <div className="mt-6">
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ isOpen: false })}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 pt-5">
        <TextField
          name="name"
          label="Name"
          fullWidth
          required
          value={form.name}

          onChange={(e) => {
            const value = e.target.value;

            setForm((prev: any) => {
              const updated = { ...prev, name: value };

              if (!isSlugEdited) {
                updated.slug = generateSlug(value.trim());
              }

              return updated;
            });
          }}

        />

        <TextField
          name="slug"
          label="Slug"
          fullWidth
          required
          value={form.slug}
          onChange={(e) => {
            setIsSlugEdited(true);
            setForm((prev: any) => ({
              ...prev,
              slug: generateSlug(e.target.value),
            }));
          }}

        />

        <TextField
          name="menuId"
          label="Parent Menu"
          select
          fullWidth
          required
          value={form.menuId}
          onChange={(e) =>
            setForm({ ...form, menuId: Number(e.target.value) })
          }
        >
          {menus.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.name} ({m.type})
            </MenuItem>
          ))}
        </TextField>

        {/* ====== PRODUCT MENU LOGIC ====== */}
        {selectedMenu?.type === "product" && (
          <>
            <TextField
              name="categoryId"
              label="Category"
              select
              fullWidth
              value={form.categoryId}
              onChange={(e) => {
                const selectedValue = Number(e.target.value);
                setForm({
                  ...form,
                  categoryId: selectedValue,
                  leftSubcategories: [],
                  rightSubcategories: [],
                });
              }}
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* <Divider className="my-4" /> */}

            {/* <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
              {["left", "right"].map((side) => (
                <div key={side}>
                  <TextField
                    name={`${side}Subcategories`}
                    label={`${side === "left" ? "Left" : "Right"} Product Subcategories`}
                    select
                    fullWidth
                    SelectProps={{
                      multiple: true,
                      value: form[`${side}Subcategories`],
                      onChange: (e: any) =>
                        setForm({
                          ...form,
                          [`${side}Subcategories`]: e.target.value.map(Number),
                        }),
                      renderValue: (selected: any) =>
                        filteredSubcategories
                          .filter((s) => selected.includes(s.id))
                          .map((s) => s.name)
                          .join(", "),
                    }}
                  >
                    {filteredSubcategories
                      .filter(
                        (s) =>
                          side === "left" ||
                          !form.leftSubcategories.includes(s.id)
                      )
                      .map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                  </TextField>

                  <Typography className="mt-4 font-medium text-gray-700 text-sm">
                    Custom {side === "left" ? "Left" : "Right"} Links
                  </Typography>

                  {form[`${side}CustomLinks`].map((link: any, idx: number) => (
                    <Box key={idx} className="flex gap-2 mt-2 items-center">
                      <TextField
                        label="Name"
                        size="small"
                        value={link.name}
                        onChange={(e) =>
                          handleCustomLinkChange(
                            side as any,
                            idx,
                            "name",
                            e.target.value
                          )
                        }
                      />
                      <TextField
                        label="Slug"
                        size="small"
                        value={link.slug}
                        onChange={(e) =>
                          handleCustomLinkChange(
                            side as any,
                            idx,
                            "slug",
                            e.target.value
                          )
                        }
                      />
                      <IconButton
                        onClick={() => handleRemoveCustomLink(side as any, idx)}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddCustomLink(side as any)}
                    className="mt-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-sm px-3 py-1.5 rounded-md transition shadow-sm"
                  >
                    + Add Custom Link
                  </button>
                </div>
              ))}
            </Box> */}
          </>
        )}

        {/* ====== BLOG MENU LOGIC ====== */}
        {/* {selectedMenu?.type === "blog" && (
          <>
            <Divider className="my-4" />
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["left", "right"].map((side) => (
                <div key={side}>
                  <TextField
                    name={`${side}Subcategories`}
                    label={`${side === "left" ? "Left" : "Right"} Blog Categories`}
                    select
                    fullWidth
                    SelectProps={{
                      multiple: true,
                      value: form[`${side}Subcategories`],
                      onChange: (e: any) =>
                        setForm({
                          ...form,
                          [`${side}Subcategories`]: e.target.value.map(Number),
                        }),
                      renderValue: (selected: any) =>
                        blogCategories
                          .filter((s) => selected.includes(s.id))
                          .map((s) => s.name)
                          .join(", "),
                    }}
                  >
                    {blogCategories
                      .filter(
                        (s) =>
                          side === "left" ||
                          !form.leftSubcategories.includes(s.id)
                      )
                      .map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                  </TextField>

                  <Typography className="mt-4 font-medium text-gray-700 text-sm">
                    Custom {side === "left" ? "Left" : "Right"} Links
                  </Typography>

                  {form[`${side}CustomLinks`].map((link: any, idx: number) => (
                    <Box key={idx} className="flex gap-2 mt-2 items-center">
                      <TextField
                        label="Name"
                        size="small"
                        value={link.name}
                        onChange={(e) =>
                          handleCustomLinkChange(
                            side as any,
                            idx,
                            "name",
                            e.target.value
                          )
                        }
                      />
                      <TextField
                        label="Slug"
                        size="small"
                        value={link.slug}
                        onChange={(e) =>
                          handleCustomLinkChange(
                            side as any,
                            idx,
                            "slug",
                            e.target.value
                          )
                        }
                      />
                      <IconButton
                        onClick={() => handleRemoveCustomLink(side as any, idx)}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddCustomLink(side as any)}
                    className="mt-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-sm px-3 py-1.5 rounded-md transition shadow-sm"
                  >
                    + Add Custom Link
                  </button>
                </div>
              ))}
            </Box>
          </>
        )} */}

        <Divider className="my-4" />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`${submitting ? "opacity-70 cursor-not-allowed" : ""
              } bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white font-medium px-6 py-2 rounded-md shadow transition`}
          >
            {submitting
              ? "Saving..."
              : submenuId
                ? "Update Submenu"
                : "Save Submenu"}
          </button>
        </div>
      </form>
    </Box>
  );
}
