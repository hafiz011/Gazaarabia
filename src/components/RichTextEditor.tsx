"use client";

import dynamic from "next/dynamic";

const TinyMCEEditor = dynamic(() => import("@tinymce/tinymce-react").then((m) => m.Editor), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  label = "Content",
  required = false,
  minHeight = 300,
}: RichTextEditorProps) {

  const handleImageUpload = (blobInfo: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = false;
      xhr.open("POST", "/api/upload?folder=editor");

      xhr.upload.onprogress = (e) => {
        // Handle upload progress if needed
      };

      xhr.onload = () => {
        if (xhr.status !== 200) {
          reject({
            message: `Upload failed: ${xhr.status}`,
            remove: true,
          });
          return;
        }
        const json = JSON.parse(xhr.responseText);
        if (!json || typeof json.url !== "string") {
          reject("Invalid response from server");
          return;
        }
        resolve(json.url as string);
      };

      xhr.onerror = () => {
        reject("Image upload failed. Check your connection.");
      };

      const formData = new FormData();
      formData.append("file", blobInfo.blob(), blobInfo.filename());
      xhr.send(formData);
    });
  };

  return (
    <>
      <style jsx>{`
        .rich-text-editor-wrapper {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .rich-text-editor-wrapper:hover {
          border-color: #d1d5db;
        }

        .rich-text-editor-wrapper:focus-within {
          border-color: var(--brand-primary, #c73030);
          box-shadow: 0 0 0 2px rgba(199, 48, 48, 0.1);
        }

        .editor-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .editor-label.required::after {
          content: " *";
          color: #dc2626;
        }

        /* TinyMCE styling */
        :global(.tox.tox-tinymce) {
          border: none !important;
        }

        :global(.tox-editor-header) {
          background-color: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
        }

        :global(.tox .tox-tbtn) {
          color: #6b7280 !important;
        }

        :global(.tox .tox-tbtn:hover),
        :global(.tox .tox-tbtn:focus),
        :global(.tox .tox-tbtn--active) {
          color: var(--brand-primary, #c73030) !important;
          background-color: rgba(199, 48, 48, 0.1) !important;
        }

        :global(.tox .tox-tbtn:hover::before),
        :global(.tox .tox-tbtn:focus::before) {
          background-color: rgba(199, 48, 48, 0.1) !important;
        }

        :global(.tox .tox-edit-area__iframe) {
          font-family: inherit !important;
          font-size: 0.95rem !important;
          line-height: 1.6 !important;
          color: #1f2937 !important;
        }

        :global(.tox .tox-menubar) {
          background-color: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
        }

        :global(.tox .tox-mbtn) {
          color: #6b7280 !important;
        }

        :global(.tox .tox-mbtn:hover) {
          color: var(--brand-primary, #c73030) !important;
        }
      `}</style>

      <div>
        {label && (
          <label className={`editor-label ${required ? "required" : ""}`}>
            {label}
          </label>
        )}
        <div className="rich-text-editor-wrapper">
          <TinyMCEEditor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            licenseKey="gpl"
            value={value}
            onEditorChange={onChange}
            init={{
              height: minHeight,
              menubar: true,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "wordcount",
                "visualblocks",
                "visualchars",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "nonbreaking",
                "save",
                "table",
                "directionality",
                "emoticons",
                "codesample",
              ],
              toolbar:
                "undo redo | blocks | bold italic backcolor forecolor | " +
                "alignleft aligncenter alignright alignjustify | " +
                "bullist numlist outdent indent | " +
                "link image media table | " +
                "searchreplace | " +
                "code fullscreen | " +
                "removeformat",
              toolbar_sticky: true,
              toolbar_location: "top",
              relative_urls: false,
              remove_script_host: false,
              convert_urls: false,
              automatic_uploads: true,
              file_picker_types: "image",
              images_upload_handler: handleImageUpload as any,
              font_family_formats:
                "Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monospace; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings",
              font_size_formats: "8px 10px 12px 14px 16px 18px 20px 24px 28px 32px 36px",
              content_style:
                "body { font-family: inherit; font-size: 14px; line-height: 1.6; } img { max-width: 100%; }",
              placeholder: placeholder,
              branding: false,
              promotion: false,
            }}
          />
        </div>
      </div>
    </>
  );
}
