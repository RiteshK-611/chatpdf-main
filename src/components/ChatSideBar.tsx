"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "react-hot-toast";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSideBar = ({ chats: initialChats, chatId, isPro }: Props) => {
  const [chats, setChats] = useState<DrizzleChat[]>(initialChats);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number) => {
    // Display a toast with a spinner
    const toastId = toast.loading("Deleting chat...");

    try {
      const response = await axios.post("/api/delete-chat", { chatId: id });
      if (response.status === 200) {
        // If the deletion was successful, update the toast and the state
        toast.success("Chat deleted successfully", { id: toastId });
        setChats(response.data.chats);
      } else {
        // If there was an error, update the toast
        toast.error("Failed to delete chat", { id: toastId });
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat", { id: toastId });
    }
  };

  return (
    <div className="w-full max-h-screen soff p-4 text-gray-200 bg-gray-900">
      <Link href="/">
        <Button className="w-full border-dashed border-white border hover:border-dotted">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>

      <div
        className="flex overflow-hidden hover:overflow-y-auto flex-col gap-2 mt-4 pr-2.5"
        style={{ height: "calc(100vh - 5.5rem)" }}>
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn(
                "rounded-lg p-3 text-slate-300 flex items-center group",
                {
                  "bg-blue-600 text-white": chat.id === chatId,
                  "hover:text-white": chat.id !== chatId,
                }
              )}>
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
              <Trash
                className="ml-2 collapse group-hover:visible"
                onClick={() => handleDelete(chat.id)}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatSideBar;
