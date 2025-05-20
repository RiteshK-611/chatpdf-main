// #region OpenAI
// import { OpenAIApi, Configuration } from "openai-edge";

// const config = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(config);

// export async function getEmbeddings(text: string) {
//   console.log("Embeddings Text: ", text);
//   try {
//     const response = await openai.createEmbedding({
//       model: "text-embedding-ada-002",
//       input: text.replace(/\n/g, " "),
//     });
//     const result = await response.json();
//     return result.data[0].embedding as number[];
//   } catch (error) {
//     console.log("error calling openai embeddings api", error);
//     throw error;
//   }
// }
// #endregion

// #region Cohere
// import { CohereClient } from "cohere-ai";

// export const getEmbeddings = async (texts: string[]) => {
//   try {
//     console.log("Init Cohere");
//     const cohere = new CohereClient({
//       token: process.env.COHERE_API_KEY!,
//     });

//     console.log("Creating Embeddings");
//     const vectors = await cohere.embed({
//       texts,
//       model: "embed-multilingual-v2.0",
//     });

//     console.log("Embeddings: ", vectors.embeddings);

//     return vectors.embeddings;
//   } catch (error) {
//     console.log("error calling cohere embedding api", error);
//     throw error;
//   }
// };
// #endregion

import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

export async function getEmbeddings(text: string) {
  try {
    // Use the latest recommended Gemini embedding model: 'text-embedding-004'
    // See: https://ai.google.dev/gemini-api/docs/embeddings#embedding-models
    const result = await genAI.models.embedContent({
      model: "gemini-embedding-exp-03-07",
      contents: text,
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: 1536
      },
    });

    return result.embeddings![0].values as number[];
  } catch (error) {
    console.log("error calling google embeddings api", error);
    throw error;
  }
}
