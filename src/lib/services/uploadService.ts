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
};
