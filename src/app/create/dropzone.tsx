import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";

const DropZone = (props: { onFileUpload: (file: File) => void }) => {
  const { getRootProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      props.onFileUpload(acceptedFiles[0]);
    },
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-powerpoint": [".pptx"],
    },
    maxFiles: 1,
  });

  return (
    <button
      {...getRootProps()}
      className="w-full aspect-[3/2] sm:aspect-[2/1] flex flex-col p-10 items-center justify-center gap-2 bg-blue-50/50 rounded-2xl border-[3px] border-opacity-70 border-dashed border-black"
      onClick={() => document.getElementById("doc")?.click()}
    >
      <FiUpload className="w-10 h-10 p-2 bg-white rounded-xl border border-black/30" />

      {isDragActive ? (
        <p className="font-semibold">Drop the file here...</p>
      ) : (
        <p className="text-sm">
          Click here to upload your file, or drag and drop it here
        </p>
      )}
    </button>
  );
};

export default DropZone;
