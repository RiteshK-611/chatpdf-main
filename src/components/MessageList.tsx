import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";

type Props = {
  isLoading: boolean;
  messages: Message[];
};

const MessageList = ({ messages, isLoading }: Props) => {
  // Example queries
  const exampleQueries = [
    "What is the main argument of this document?",
    "Can you summarize the content of the PDF?",
    "What are the key points discussed in the conclusion section?",
    "Who is the author of this document?",
    "What is the publication date of this document?",
    "Can you explain the term 'XYZ' mentioned on page 5?",
    "What does the diagram on page 3 represent?",
  ];

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (messages.length === 0)
    return (
      <>
        <div
          className="p-4 gap-1 flex flex-col justify-center"
          style={{ height: "calc(100vh - 7.25rem)" }}>
          <h4 className="font-bold mb-2">Example Queries:</h4>
          {exampleQueries.map((query, index) => (
            <p
              className="rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10"
              key={index}>
              {query}
            </p>
          ))}
        </div>
      </>
    );
  return (
    <div
      className="flex flex-col gap-2 px-4 overflow-y-auto"
      style={{ height: "calc(100vh - 7.25rem)" }}>
      {messages.map((message, index) => {
        return (
          <div
            key={message.id}
            className={cn("flex my-1", {
              "justify-end pl-10": message.role === "user",
              "justify-start pr-10": message.role === "assistant",
            })}>
            <div
              ref={index === messages.length - 1 ? messagesEndRef : null}
              className={cn(
                "rounded-lg px-3 text-sm py-2 shadow-md ring-1 ring-gray-900/10",
                {
                  "bg-blue-600 text-white": message.role === "user",
                }
              )}>
              <p>{message.content}</p>
            </div>
          </div>
        );
      })}
      {/* <div ref={messagesEndRef} /> */}
    </div>
  );
};

export default MessageList;
