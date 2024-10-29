"use client";
import ReactQuill from "react-quill";

import "react-quill/dist/quill.bubble.css";

type EditorProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  isTextArea: boolean;
  placeholder: string;
};

export default function TextEditor(props: EditorProps) {
  const toolbarOptions = [
    ["bold", "italic", "underline"],
    ["link", "blockquote", "code-block", "formula"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ header: [1, 2, 3, false] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
  ];
  const id = "editor-" + crypto.randomUUID();

  return (
    <div className="relative">
      <ReactQuill
        id={id}
        modules={{ toolbar: toolbarOptions }}
        theme="bubble"
        value={props.value}
        onChange={(value) =>
          value === "" ? props.onChange(undefined) : props.onChange(value)
        }
        placeholder={props.placeholder}
        className={`quill-editor ${id}`}
      />
      <style>
        {`
      .${id} .ql-editor {
        height: auto;
        max-height: 70vh; /* Maximum height for the editor content */
        ${props.isTextArea ? "min-height: 5rem;" : "min-height: 0rem;"}
        overflow-y: auto;
        font-size: 0.875rem;
        line-height: 1.25rem;
      }
      .${id} .ql-toolbar {
        z-index: 10;
      }
      `}
      </style>
    </div>
  );
}
