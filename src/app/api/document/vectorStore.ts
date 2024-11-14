"use server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";

export async function getEmbeddings() {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "text-embedding-004", // 768 dimensions
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });

    return embeddings;
  } catch (e) {
    throw new Error(`Error while getting embeddings, the error is: ${e}`);
  }
}

export async function addToVectorStore(data: Document[], documentId: string) {
  try {
    const embeddings = await getEmbeddings();

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_KEY,
        collectionName: "documents",
      }
    );
    const chunks = data.map((doc, index) => {
      return {
        ...doc,
        metadata: {
          ...(doc.metadata ? doc.metadata : {}),
          documentId,
          chunkIndex: index,
        },
      };
    });

    await Promise.all(
      chunks
        .reduce((acc, _, i) => {
          if (i % 20 === 0) acc.push(chunks.slice(i, i + 20));
          return acc;
        }, [] as Document[][])
        .map((chunkSlice) => {
          console.log("Adding slice of to vector store");
          return vectorStore.addDocuments(chunkSlice);
        })
    );
  } catch (e) {
    throw new Error(`Error while adding to vector store, the error is: ${e}`);
  }
}

export async function queryVectorStore(
  documentId: string,
  query: string,
  numberOfResults: number
) {
  try {
    const embeddings = await getEmbeddings();

    const filter = {
      must: [{ key: "metadata.documentId", match: { value: documentId } }],
    };

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_KEY,
        collectionName: "documents",
      }
    );

    const similaritySearchResults = await vectorStore.similaritySearch(
      query,
      numberOfResults,
      filter
    );

    return similaritySearchResults;
  } catch (e) {
    throw new Error(`Error while querying vector store, the error is: ${e}`);
  }
}

export async function queryVectorStoreFromChunkIndex(
  documentId: string,
  chunkIndex: number
) {
  try {
    const embeddings = await getEmbeddings();

    const filter = {
      must: [
        { key: "metadata.documentId", match: { value: documentId } },
        { key: "metadata.chunkIndex", match: { value: chunkIndex } },
      ],
    };

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_KEY,
        collectionName: "documents",
      }
    );

    const similaritySearchResults = await vectorStore.similaritySearch(
      "",
      1,
      filter
    );

    return similaritySearchResults[0];
  } catch (e) {
    throw new Error(
      `Error while querying vector store from chunk index, the error is: ${e}`
    );
  }
}
