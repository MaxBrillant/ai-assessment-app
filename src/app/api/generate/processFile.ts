"use server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";

export async function ProcessFile(
  fileBlob: Blob,
  type: "pdf" | "docx" | "pptx"
) {
  try {
    if (type === "pdf") {
      const loader = new PDFLoader(fileBlob);
      const docs = await loader.load();
      return docs.map((doc) => doc.pageContent);
    } else if (type === "docx") {
      const loader = new DocxLoader(fileBlob);
      const docs = await loader.load();
      return docs.map((doc) => doc.pageContent);
    } else {
      const loader = new PPTXLoader(fileBlob);
      const docs = await loader.load();
      return docs.map((doc) => doc.pageContent);
    }
  } catch (e) {
    throw new Error(`Error while processing the file, the error is: ${e}`);
  }
}
