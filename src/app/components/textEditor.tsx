"use client";
import { useEffect } from "react";
import ReactQuill from "react-quill";

import "react-quill/dist/quill.snow.css";

type EditorProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  isTextArea: boolean;
  hasFocus?: boolean;
  placeholder: string;
};

export default function TextEditor(props: EditorProps) {
  const id = "editor-" + crypto.randomUUID();

  useEffect(() => {
    if (props.hasFocus) {
      const editor = document
        .getElementById(id)
        ?.querySelector(".ql-editor") as HTMLElement;

      editor?.focus();
      // const range = document.createRange();
      // const sel = window.getSelection();
      // range.setStart(editor, editor.childNodes.length);
      // range.collapse(true);
      // sel?.removeAllRanges();
      // sel?.addRange(range);
    }
  }, []);

  const toolbarOptions = [
    ["bold", "italic", "underline", "code-block"],
    // [{ list: "ordered" }, { list: "bullet" }],
    // [{ header: [1, 2, 3, false] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
  ];

  return (
    <div className="relative">
      <ReactQuill
        id={id}
        modules={{ toolbar: toolbarOptions }}
        theme="snow"
        value={props.value}
        onChange={(value) => {
          value === "" ? props.onChange(undefined) : props.onChange(value);
        }}
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
      .${id} .ql-container {
        border: none;
      }
      // .${id}:focus-within .ql-container {
      //   border: 1px solid rgb(0 0 0 / 0.3);
      // }

      .${id} .ql-toolbar {
        background-color: white;
        width: 100%;
        height: 0;
        opacity: 0;
        overflow: hidden;
        transition: all 0.2s ease-in-out;
        padding: 0;
        border: none;
      }
      .${id}:focus-within .ql-toolbar {
        opacity: 1;
        height: auto;
        padding: 0.5rem;
        overflow: visible;
      }
      `}
      </style>
    </div>
  );
}
