"use client";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type editorProps = {
  id: string;
  value: string | undefined;
  onChange: (value: string) => void;
};
export default function TextEditor(props: editorProps) {
  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["link", "blockquote", "code-block", "formula"],

    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript

    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ align: [] }],
  ];

  return (
    <ReactQuill
      id={props.id}
      key={props.id}
      modules={{ toolbar: toolbarOptions }}
      theme="snow"
      value={props.value}
      onChange={(value) => {
        props.onChange(value);
      }}
      placeholder="Write your answer here"
      className="quill-editor"
    />
  );
}
