// import { PutObjectCommandOutput, S3 } from "@aws-sdk/client-s3";

// export async function uploadToS3(
//   file: File
// ): Promise<{ file_key: string; file_name: string }> {
//   return new Promise((resolve, reject) => {
//     try {
//       const s3 = new S3({
//         region: "ap-southeast-1",
//         credentials: {
//           accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
//           secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
//         },
//       });

//       const file_key =
//         "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

//       const params = {
//         Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
//         Key: file_key,
//         Body: file,
//       };
//       s3.putObject(
//         params,
//         (err: any, data: PutObjectCommandOutput | undefined) => {
//           return resolve({
//             file_key,
//             file_name: file.name,
//           });
//         }
//       );
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

// export function getS3Url(file_key: string) {
//   const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${file_key}`;
//   return url;
// }

import S3 from "aws-sdk/clients/s3";

const s3 = new S3({
  accessKeyId: process.env.NEXT_PUBLIC_STORJ_ACCESS_KEY2,
  secretAccessKey: process.env.NEXT_PUBLIC_STROJ_SECRET_ACCESS_KEY2,
  endpoint: process.env.NEXT_PUBLIC_STORJ_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
  httpOptions: { timeout: 0 },
});

export const uploadToS3 = async (file: File) => {
  try {
    const file_key =
      "uploads/" + Date.now().toString() + file.name.replaceAll(" ", "-");

    const params = {
      Bucket: process.env.NEXT_PUBLIC_STORJ_BUCKET_NAME!,
      Key: file_key,
      Body: file,
    };

    await s3
      .putObject(params)
      .on("httpUploadProgress", (e) => {
        console.log(
          "uploading to storj... ",
          parseInt(((e.loaded * 100) / e.total).toString())
        );
      })
      .promise()
      .then(() => {
        console.log("successfully uploaded!", file_key);
      });

    return Promise.resolve({
      file_key,
      file_name: file.name,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getS3Url = (file_key: string) => {
  const params = {
    Bucket: process.env.NEXT_PUBLIC_STORJ_BUCKET_NAME!,
    Key: file_key,
  };
  const url = s3.getSignedUrl("getObject", params);
  return url;
};
