import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

// #region OpenAI
// export const getPineconeClient = () => {
//   return new Pinecone({
//     environment: process.env.PINECONE_ENVIRONMENT!,
//     apiKey: process.env.PINECONE_API_KEY!,
//   });
// };

// type PDFPage = {
//   pageContent: string;
//   metadata: {
//     loc: { pageNumber: number };
//   };
// };

// export async function loadS3IntoPinecone(fileKey: string) {
//   // 1. obtain the pdf -> downlaod and read from pdf
//   console.log("downloading s3 into file system");
//   const file_name = await downloadFromS3(fileKey);
//   if (!file_name) {
//     throw new Error("could not download from s3");
//   }
//   console.log("loading pdf into memory " + file_name);
//   const loader = new PDFLoader(file_name);
//   const pages = (await loader.load()) as PDFPage[];

//   // 2. split and segment the pdf
//   const documents = await Promise.all(pages.map(prepareDocument));

//   // 3. vectorise and embed individual documents
// const vectors = await Promise.all(documents.flat().map(embedDocument))

//   // 4. upload to pinecone
//   const client = await getPineconeClient();
//   const pineconeIndex = await client.index("chatpdf");
//   const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

//   console.log("inserting vectors into pinecone");
//   await namespace.upsert(vectors);

//   return documents[0];
// }

// async function embedDocument(doc: Document) {
//   try {
//     const embeddings = await getEmbeddings(doc.pageContent);
//     const hash = md5(doc.pageContent);

//     return {
//       id: hash,
//       values: embeddings,
//       metadata: {
//         text: doc.metadata.text,
//         pageNumber: doc.metadata.pageNumber,
//       },
//     } as PineconeRecord;
//   } catch (error) {
//     console.log("error embedding document", error);
//     throw error;
//   }
// }

// export const truncateStringByBytes = (str: string, bytes: number) => {
//   const enc = new TextEncoder();
//   return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
// };

// async function prepareDocument(page: PDFPage) {
//   let { pageContent, metadata } = page;
//   pageContent = pageContent.replace(/\n/g, "");
//   // split the docs
//   const splitter = new RecursiveCharacterTextSplitter();
//   const docs = await splitter.splitDocuments([
//     new Document({
//       pageContent,
//       metadata: {
//         pageNumber: metadata.loc.pageNumber,
//         text: truncateStringByBytes(pageContent, 36000),
//       },
//     }),
//   ]);
//   return docs;
// }
// #endregion

// #region Cohere
// export async function loadS3IntoPinecone(fileKey: string) {
//   // 1. obtain the pdf -> download and read from pdf
//   console.log("downloading pdf into file system...");
//   const file_name = await downloadFromS3(fileKey);

//   if (!file_name) {
//     throw new Error("could not download pdf");
//   }
//   console.log("File Name: ", file_name);
//   const loader = new PDFLoader(file_name);

//   const docs = await loader.load();

//   console.log("Splitteing PDF");
//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//     chunkOverlap: 200,
//   });
//   const splittedDocs = await splitter.splitDocuments(docs);
//   const pageContents = splittedDocs.map((doc) => doc.pageContent);

//   const vectors = await embedPDF(pageContents, fileKey);

//   storePDF(vectors);
// }

// export const embedPDF = async (texts: string[], file_key: string) => {
//   try {
//     const embeddings = await getEmbeddings(texts);

//     console.log("Creating PDF Docs Vectors");
//     const docsVec = embeddings.map((embedding, index) => {
//       const hash = md5(embedding);
//       return {
//         id: hash,
//         values: embedding,
//         metadata: {
//           text: texts[index],
//           pdfKey: file_key,
//         },
//       } as PineconeRecord;
//     });
//     console.log(embeddings.length, "Embeddings created");

//     return docsVec;
//   } catch (error) {
//     console.log("Error Embedding text with Cohere");
//     throw error;
//   }
// };

// const storePDF = async (vectors: PineconeRecord[]) => {
//   try {
//     console.log("Init Pinecone");
//     const pinecone = new Pinecone({
//       apiKey: process.env.PINECONE_API_KEY!,
//       environment: process.env.PINECONE_ENVIRONMENT!,
//     });
//     const index = pinecone.Index("chatpdf-cohere");

//     console.log("Upserting into Pinecone");
//     await index?.upsert(vectors);
//     console.log("Done Upserting!!");
//   } catch (error) {
//     console.log("error", error);
//     throw error;
//   }
// };
// #endregion

// #region Google
type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf -> downlaod and read from pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("could not download from s3");
  }
  console.log("loading pdf into memory " + file_name);
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf
  const documents = await Promise.all(pages.map(prepareDocument));

  // 3. vectorise and embed individual documents
  const vectors = await Promise.all(
    documents.flat().map((doc) => embedDocument(doc, fileKey))
  );

  // 4. upload to pinecone
  await uploadVec(vectors);
}

async function embedDocument(doc: Document, file_key: string) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    console.log(embeddings.length, "Embeddings created");
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pdfKey: file_key,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, " ");
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}

const uploadVec = async (vectors: PineconeRecord[]) => {
  try {
    console.log("Init Pinecone");
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });
    const index = pinecone.Index("chatpdf-google");

    console.log("Upserting into Pinecone");
    await index?.upsert(vectors);
    console.log("Done Upserting!!");
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};
// #endregion
