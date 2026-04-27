"use client";

import dynamic from "next/dynamic";
import { CSSProperties, useMemo, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    const { default: BlotFormatter } = await import("quill-blot-formatter");
    RQ.Quill.register("modules/blotFormatter", BlotFormatter);
    const DynamicRQ = ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
    DynamicRQ.displayName = "DynamicRQ";
    return DynamicRQ;
  },
  {
    ssr: false,
    loading: () => <p>Loading editor...</p>,
  }
);

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
  const quillRef = useRef<any>(null);

  const editorStyle: CSSProperties = {
    minHeight: `${minHeight}px`,
  };

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/upload?folder=editor", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.url) {
            const quill = quillRef.current?.getEditor();
            const range = quill?.getSelection();
            if (quill && range) {
              quill.insertEmbed(range.index, "image", data.url);
              quill.setSelection(range.index + 1);
            }
          }
        } catch (error) {
          console.error("Image upload failed", error);
        }
      }
    };
  };

  const videoHandler = () => {
    const url = prompt("Enter Video URL (YouTube, Vimeo, etc.):");
    if (url) {
      const embedUrl = convertToEmbedUrl(url);
      const quill = quillRef.current?.getEditor();
      const range = quill?.getSelection();
      if (quill && range) {
        quill.insertEmbed(range.index, "video", embedUrl);
        quill.setSelection(range.index + 1);
      }
    }
  };

  const convertToEmbedUrl = (url: string) => {
    let videoUrl = url;
    if (videoUrl.includes("youtube.com/watch?v=")) {
      videoUrl = videoUrl.replace("watch?v=", "embed/");
      // Remove any additional params like &t= or &ab_channel=
      if (videoUrl.includes("&")) {
        videoUrl = videoUrl.split("&")[0];
      }
    } else if (videoUrl.includes("youtu.be/")) {
      videoUrl = videoUrl.replace("youtu.be/", "youtube.com/embed/");
      if (videoUrl.includes("?")) {
        videoUrl = videoUrl.split("?")[0];
      }
    } else if (videoUrl.includes("vimeo.com/")) {
      videoUrl = videoUrl.replace("vimeo.com/", "player.vimeo.com/video/");
    }
    return videoUrl;
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ header: [1, 2, 3, false] }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
          video: videoHandler,
        },
      },
      blotFormatter: {},
    }),
    []
  );

  const formats = [
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "script",
    "indent",
    "header",
    "align",
    "link",
    "image",
    "video",
  ];

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

        .rich-text-editor-wrapper:global(.ql-focus),
        .rich-text-editor-wrapper:has(:global(.ql-editor:focus)) {
          border-color: var(--brand-primary, #c73030);
          box-shadow: 0 0 0 2px rgba(199, 48, 48, 0.1);
        }

        .rich-text-editor-wrapper :global(.ql-toolbar) {
          background-color: #f9fafb;
          border: none !important;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 8px;
        }

        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow) {
          padding: 8px;
        }

        .rich-text-editor-wrapper :global(.ql-container) {
          font-size: 1rem;
          font-family: inherit;
          border: none !important;
        }

        .rich-text-editor-wrapper :global(.ql-editor) {
          padding: 16px 12px;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #1f2937;
        }

        .rich-text-editor-wrapper :global(.ql-editor.ql-blank::before) {
          color: #9ca3af;
          font-style: normal;
        }

        .rich-text-editor-wrapper :global(.ql-toolbar button) {
          width: 32px;
          height: 32px;
        }

        .rich-text-editor-wrapper :global(.ql-toolbar button:hover),
        .rich-text-editor-wrapper :global(.ql-toolbar button:focus),
        .rich-text-editor-wrapper :global(.ql-toolbar button.ql-active) {
          color: var(--brand-primary, #c73030);
        }

        .rich-text-editor-wrapper :global(.ql-toolbar button.ql-active svg) {
          stroke: var(--brand-primary, #c73030);
        }

        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow .ql-stroke) {
          stroke: #6b7280;
        }

        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow .ql-stroke.ql-active),
        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow button:hover .ql-stroke),
        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow button:focus .ql-stroke) {
          stroke: var(--brand-primary, #c73030);
        }

        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow .ql-fill),
        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow .ql-stroke.ql-fill) {
          fill: #6b7280;
        }

        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow .ql-fill.ql-active),
        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow button:hover .ql-fill),
        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow button:focus .ql-fill),
        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow button:hover .ql-stroke.ql-fill),
        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow button:focus .ql-stroke.ql-fill) {
          fill: var(--brand-primary, #c73030);
        }

        .rich-text-editor-wrapper :global(.ql-picker-label) {
          color: #6b7280;
        }

        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow .ql-picker-label:hover),
        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow .ql-picker-item:hover),
        .rich-text-editor-wrapper :global(.ql-toolbar.ql-snow .ql-picker-item.ql-selected) {
          color: var(--brand-primary, #c73030);
        }

        .rich-text-editor-wrapper :global(.ql-editor img),
        .rich-text-editor-wrapper :global(.ql-editor .ql-video) {
          max-width: 100%;
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
      `}</style>

      <div>
        {label && (
          <label className={`editor-label ${required ? "required" : ""}`}>
            {label}
          </label>
        )}
        <div className="rich-text-editor-wrapper">
          <ReactQuill
            forwardedRef={quillRef}
            value={value}
            onChange={onChange}
            theme="snow"
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            style={editorStyle}
          />
        </div>
      </div>
    </>
  );
}
