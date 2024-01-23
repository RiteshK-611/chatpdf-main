import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// /api/delete-chat
export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { chatId } = await req.json();

    const [chat] = await db.select().from(chats).where(eq(chats.id, chatId));
    console.log("Getting chats...")

    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found!");
    }

    await db.delete(messages).where(eq(messages.chatId, chatId));
    await db.delete(chats).where(eq(chats.id, chatId));

    console.log("Chats Deleted!")

    // Fetch the updated list of chats
    const updatedChats = await db.select().from(chats).where(eq(chats.userId, userId));

    return NextResponse.json(
      {
        message: "Chat deleted successfully",
        chats: updatedChats, // Return the updated list of chats
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
