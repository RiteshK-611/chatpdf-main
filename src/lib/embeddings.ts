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


import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function getEmbeddings(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.log("error calling google embeddings api", error);
    throw error;
  }
}
