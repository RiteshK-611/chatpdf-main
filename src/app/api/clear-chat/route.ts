import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import toast from "react-hot-toast";

// /api/clear-chat
export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { chatId } = await req.json();
    await db.delete(messages).where(eq(messages.chatId, chatId));
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
