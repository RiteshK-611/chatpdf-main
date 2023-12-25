import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });
    const index = pinecone.Index("chatpdf-google");
    const queryResponse = await index.query({
      topK: 5,
      vector: embeddings,
      filter: { pdfKey: { $eq: fileKey } },
      includeMetadata: true,
    });

    return queryResponse.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  console.log("In getContext -> fileKey: ", fileKey);
  console.log("In getContext -> matches: ", matches);

  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );

  type Metadata = {
    text: string;
    pdfKey: string;
  };

  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);

  console.log("In getContext -> docs: ", docs);

  // 5 vectors
  return docs.join("\n").substring(0, 3000);
}
