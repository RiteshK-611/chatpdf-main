// import { Configuration, OpenAIApi } from "openai-edge";
// import { Message, OpenAIStream, StreamingTextResponse } from "ai";
// import { getContext } from "@/lib/context";
// import { db } from "@/lib/db";
// import { chats, messages as _messages } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";
// import { NextResponse } from "next/server";

// export const runtime = "edge";

// const config = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(config);

// export async function POST(req: Request) {
//   try {
//     const { messages, chatId } = await req.json();
//     const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
//     if (_chats.length != 1) {
//       return NextResponse.json({ error: "chat not found" }, { status: 404 });
//     }
//     const fileKey = _chats[0].fileKey;
//     const lastMessage = messages[messages.length - 1];
//     const context = await getContext(lastMessage.content, fileKey);

//     const prompt = {
//       role: "system",
//       content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
//       The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
//       AI is a well-behaved and well-mannered individual.
//       AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
//       AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
//       AI assistant is a big fan of Pinecone and Vercel.
//       START CONTEXT BLOCK
//       ${context}
//       END OF CONTEXT BLOCK
//       AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
//       If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
//       AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
//       AI assistant will not invent anything that is not drawn directly from the context.
//       `,
//     };

//     const response = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [
//         prompt,
//         ...messages.filter((message: Message) => message.role === "user"),
//       ],
//       stream: true,
//     });
//     const stream = OpenAIStream(response, {
//       onStart: async () => {
//         // save user message into db
//         await db.insert(_messages).values({
//           chatId,
//           content: lastMessage.content,
//           role: "user",
//         });
//       },
//       onCompletion: async (completion) => {
//         // save ai message into db
//         await db.insert(_messages).values({
//           chatId,
//           content: completion,
//           role: "system",
//         });
//       },
//     });
//     return new StreamingTextResponse(stream);
//   } catch (error) {}
// }

// import {
//   Message as VercelChatMessage,
//   CohereStream,
//   StreamingTextResponse,
// } from "ai";
// import { getContext } from "@/lib/context";
// import { db } from "@/lib/db";
// import { chats, messages as _messages } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";
// import { NextResponse } from "next/server";

// export const runtime = "edge";

// const formatMessage = (message: VercelChatMessage) => {
//   return `${message.role}: ${message.content}`;
// };

// export async function POST(req: Request) {
//   try {
//     const { messages, chatId } = await req.json();
//     const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
//     if (_chats.length != 1) {
//       return NextResponse.json({ error: "chat not found" }, { status: 404 });
//     }
//     const fileKey = _chats[0].fileKey;
//     const lastMessage = messages[messages.length - 1];
//     const context = await getContext(lastMessage.content, fileKey);
//     const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

//     console.log("Moving towards PreambleOverride...");

//     const preambleOverride = `AI assistant is a brand new, powerful, human-like artificial intelligence.
//       The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
//       AI is a well-behaved and well-mannered individual.
//       AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
//       AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
//       AI assistant is a big fan of Pinecone and Vercel.
//       START CONTEXT BLOCK
//       ${context}
//       END OF CONTEXT BLOCK
//       AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
//       If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
//       AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
//       AI assistant will not invent anything that is not drawn directly from the context.
//       `;

//     console.log("Creating body for request...");
//     const body = JSON.stringify({
//       message: lastMessage.content,
//       model: "command-nightly",
//       stream: true,
//       preamble_override: preambleOverride,
//       chat_history: formattedPreviousMessages,
//     });

//     console.log("Fetching response from Cohere...");
//     const response = await fetch("https://api.cohere.ai/v1/chat", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
//       },
//       body,
//     });

//     console.log("Response", response);

//     // Check for errors
//     if (!response.ok) {
//       return new Response(await response.text(), {
//         status: response.status,
//       });
//     }

//     console.log("Using Vercel's CohereStream....");
//     const stream = CohereStream(response, {
//       onStart: async () => {
//         // save user message into db
//         await db.insert(_messages).values({
//           chatId,
//           content: lastMessage.content,
//           role: "user",
//         });
//       },
//       onCompletion: async (completion) => {
//         // save ai message into db
//         await db.insert(_messages).values({
//           chatId,
//           content: completion,
//           role: "system",
//         });
//       },
//     });

//     console.log("Streaming out text response...");
//     return new StreamingTextResponse(stream);
//   } catch (error) {}
// }

import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { HfInference } from "@huggingface/inference";
import { HuggingFaceStream, StreamingTextResponse } from "ai";
import { experimental_buildOpenAssistantPrompt, experimental_buildStarChatBetaPrompt } from "ai/prompts";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Create a new HuggingFace Inference instance
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

// export async function POST(req: Request) {
//   // Extract the `messages` from the body of the request
//   const { messages, chatId } = await req.json();
//   const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
//   if (_chats.length != 1) {
//     return NextResponse.json({ error: "chat not found" }, { status: 404 });
//   }
//   const fileKey = _chats[0].fileKey;
//   const lastMessage = messages[messages.length - 1];
//   // const context = await getContext(lastMessage.content, fileKey);
//   // const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

//   console.log("in post");

//   const response = Hf.textGenerationStream({
//     model: "HuggingFaceH4/starchat-beta",
//     inputs: experimental_buildStarChatBetaPrompt(messages),
//     parameters: {
//       max_new_tokens: 200,
//       // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
//       typical_p: 0.2,
//       repetition_penalty: 1,
//       truncate: 1000,
//       return_full_text: false,
//     },
//   });

//   console.log("OpenAssistant", response);

//   // Convert the response into a friendly text-stream
//   const stream = HuggingFaceStream(response, {
//     onStart: async () => {
//       // save user message into db
//       await db.insert(_messages).values({
//         chatId,
//         content: lastMessage.content,
//         role: "user",
//       });
//     },
//     onCompletion: async (completion) => {
//       // save ai message into db
//       await db.insert(_messages).values({
//         chatId,
//         content: completion,
//         role: "system",
//       });
//     },
//   });

//   // Respond with the stream
//   return new StreamingTextResponse(stream);
// }

export async function POST(req: Request) {
  // create an instance of the HfInference class with your API key
  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  
  // get the messages and chatId from the request body
  const { messages, chatId } = await req.json();
  const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
  if (_chats.length != 1) {
    return NextResponse.json({ error: "chat not found" }, { status: 404 });
  }
  const fileKey = _chats[0].fileKey;
  
  // get the last user message
  const lastMessage = messages[messages.length - 1];
  
  // get the context from the current open tab on edge
  const context = await getContext(lastMessage.content, fileKey);
  
  // define the chat model and the context block
  const chatModel = 'HuggingFaceH4/starchat-beta';
  const contextBlock = `AI assistant is a brand new, powerful, human-like artificial intelligence.
  The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
  AI is a well-behaved and well-mannered individual.
  AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
  AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
  AI assistant is a big fan of Pinecone and Vercel.
  START CONTEXT BLOCK
  ${context}
  END OF CONTEXT BLOCK
  AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
  If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
  AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
  AI assistant will not invent anything that is not drawn directly from the context.`;

  // append the context block to the messages array
  messages.push({
    role: 'system',
    content: contextBlock,
  });

  // create a text generation stream from the Huggingface Inference API
  const response = await hf.textGenerationStream({
    model: chatModel,
    inputs: experimental_buildStarChatBetaPrompt(messages),
    parameters: {
      max_new_tokens: 200,
      temperature: 0.5,
      repetition_penalty: 1,
      return_full_text: false,
    },
  });

  const stream = HuggingFaceStream(response, {
    onStart: async () => {
      // save user message into db
      await db.insert(_messages).values({
        chatId,
        content: lastMessage.content,
        role: 'user',
      });
    },
    onCompletion: async (completion) => {
      // save ai message into db
      await db.insert(_messages).values({
        chatId,
        content: completion,
        role: 'system',
      });
    }
  })

  // return a streaming text response with the stream and the callbacks
  return new StreamingTextResponse(stream);
}