import { nanoid } from "nanoid";
import { addToVectorStore } from "./vectorStore";
import { generateTitle } from "../generate/assessment/generateTitle";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "@langchain/core/documents";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  try {
    const documentId = nanoid();

    const fileBlob = formData.get("file") as File;
    const type = formData.get("type") as "pdf" | "docx" | "pptx";
    console.log("Extracting document data...");
    const docs = await getDocumentData(fileBlob, type);

    console.log("Splitting document content into chunks...");
    const chunks = await Promise.all(
      docs.map(async (doc) => await splitDocumentContentIntoChunks(doc))
    );

    console.log("Inserting document data into vector store...");

    await addToVectorStore(chunks, documentId);

    console.log("Data inserted into vector store...");

    console.log("Generating title...");

    const title = await generateTitle(
      chunks[0].pageContent.slice(
        0,
        Math.floor(chunks[0].pageContent.length / 3)
      )
    );

    console.log("Title generated");

    return new NextResponse(
      JSON.stringify({ documentId, title, chunksLength: chunks.length }),
      { status: 200 }
    );
  } catch (e) {
    throw new Error(
      `Error while inserting file data into vector store, the error is: ${e}`
    );
  }
}

async function getDocumentData(fileBlob: Blob, type: "pdf" | "docx" | "pptx") {
  try {
    if (type === "pdf") {
      const loader = new PDFLoader(fileBlob);
      const docs = await loader.load().then((docs) => docs.slice(0, 100));
      return docs;
    } else if (type === "docx") {
      const loader = new DocxLoader(fileBlob);
      const docs = await loader.load().then((docs) => docs.slice(0, 100));
      return docs;
    } else {
      const loader = new PPTXLoader(fileBlob);
      const docs = await loader.load().then((docs) => docs.slice(0, 100));
      return docs;
    }
  } catch (e) {
    throw new Error(`Error while processing the file, the error is: ${e}`);
  }
}

async function splitDocumentContentIntoChunks(content: Document) {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments([content]);

    return chunks[0];
  } catch (e) {
    throw new Error(
      `Error while splitting the document into chunks, the error is: ${e}`
    );
  }
}
