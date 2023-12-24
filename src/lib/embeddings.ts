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

import { CohereClient } from "cohere-ai";

// Cohere
export const getEmbeddings = async (texts: string[]) => {
  try {
    console.log("Init Cohere");
    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY!,
    });

    console.log("Creating Embeddings");
    const vectors = await cohere.embed({
      texts,
      model: "embed-multilingual-v2.0",
    });

    console.log("Embeddings: ", vectors.embeddings);

    return vectors.embeddings;
  } catch (error) {
    console.log("error calling cohere embedding api", error);
    throw error;
  }
};
