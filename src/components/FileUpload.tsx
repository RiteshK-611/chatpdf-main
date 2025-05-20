"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// https://github.com/aws/aws-sdk-js-v3/issues/4126

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const [uploadStep, setUploadStep] = React.useState<
    "uploading" | "loading" | "creating"
  >("uploading");
  const { mutate, isLoading } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb!
        toast.error("File too large (limit: 10MB)");
        return;
      }

      try {
        setUploading(true);
        setUploadStep("uploading");
        // Step 1: Uploading...
        await new Promise((res) => setTimeout(res, 5000));
        const data = await uploadToS3(file);
        toast.success("File uploaded successfully!");

        // Step 2: Loading pdf...
        setUploadStep("loading");
        await new Promise((res) => setTimeout(res, 5000));

        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong");
          setUploading(false);
          return;
        }

        // Step 3: Creating chat...
        setUploadStep("creating");
        await new Promise((res) => setTimeout(res, 5000));

        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created!");
            router.push(`/chat/${chat_id}`);
          },
          onError: (err) => {
            toast.error("Error creating chat");
            console.error(err);
          },
        });

        // Loop back to Uploading... if still uploading (simulate cycle)
        setTimeout(() => {
          if (uploading) setUploadStep("uploading");
        }, 5000);
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}>
        <input {...getInputProps()} />
        {uploading || isLoading ? (
          <>
            {/* loading state */}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              {uploadStep === "uploading" && "Uploading..."}
              {uploadStep === "loading" && "Loading pdf..."}
              {uploadStep === "creating" && "Creating chat..."}
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
