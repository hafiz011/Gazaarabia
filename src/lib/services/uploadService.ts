export const uploadService = {
  /**
   * Uploads an image to the server and returns its URL.
   * @param file File object
   * @param folder Folder name to save the image (e.g., "products", "material-care")
   * @returns URL string of the uploaded file
   */
  async uploadImage(file: File, folder: string): Promise<string> {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`/api/upload?folder=${encodeURIComponent(folder)}`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to upload image: ${error}`);
    }

    const data = await res.json();
    return data.url;
  },

   // 🆕 MULTIPLE IMAGE UPLOAD
  async uploadMultiple(files: File[], folder: string) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch(`/api/uploads?folder=${folder}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.urls; // returns array of urls
  },

};
