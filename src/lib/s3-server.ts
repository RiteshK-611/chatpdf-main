// import { S3 } from "@aws-sdk/client-s3";
// import fs from "fs";
// export async function downloadFromS3(file_key: string): Promise<string> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const s3 = new S3({
//         region: "ap-southeast-1",
//         credentials: {
//           accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
//           secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
//         },
//       });
//       const params = {
//         Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
//         Key: file_key,
//       };

//       const obj = await s3.getObject(params);
//       const file_name = `/tmp/elliott${Date.now().toString()}.pdf`;

//       if (obj.Body instanceof require("stream").Readable) {
//         // AWS-SDK v3 has some issues with their typescript definitions, but this works
//         // https://github.com/aws/aws-sdk-js-v3/issues/843
//         //open the writable stream and write the file
//         const file = fs.createWriteStream(file_name);
//         file.on("open", function (fd) {
//           // @ts-ignore
//           obj.Body?.pipe(file).on("finish", () => {
//             return resolve(file_name);
//           });
//         });
//         // obj.Body?.pipe(fs.createWriteStream(file_name));
//       }
//     } catch (error) {
//       console.error(error);
//       reject(error);
//       return null;
//     }
//   });
// }

// // downloadFromS3("uploads/1693568801787chongzhisheng_resume.pdf");

import S3 from "aws-sdk/clients/s3";
import fs from "fs";
import os from "os";

export const downloadFromS3 = async (file_key: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new S3({
        accessKeyId: process.env.NEXT_PUBLIC_STORJ_ACCESS_KEY2,
        secretAccessKey: process.env.NEXT_PUBLIC_STROJ_SECRET_ACCESS_KEY2,
        endpoint: process.env.NEXT_PUBLIC_STORJ_ENDPOINT,
      });

      const params = {
        Bucket: process.env.NEXT_PUBLIC_STORJ_BUCKET_NAME!,
        Key: file_key,
      };

      console.log("\nBucket: ", process.env.NEXT_PUBLIC_STORJ_BUCKET_NAME);
      console.log("File Key: ", file_key);

      const obj = await s3.getObject(params).promise();
      let file_name: string;
      if (os.platform() === "win32") {
        file_name = `C:\\Users\\${
          os.userInfo().username
        }\\AppData\\Local\\Temp\\pdf-${Date.now()}.pdf`;
      } else {
        file_name = `/tmp/pdf-${Date.now()}.pdf`;
      }

      if (obj.Body instanceof require("stream").Readable) {
        console.log("----------Readable----------");
        const file = fs.createWriteStream(file_name);
        file.on("open", function (fd) {
          // @ts-ignore
          obj.Body?.pipe(file).on("finish", () => {
            return resolve(file_name);
          });
        });
        // obj.Body?.pipe(fs.createWriteStream(file_name));
      } else {
        console.log("----------Buffer----------");
        fs.writeFileSync(file_name, obj.Body as Buffer);
        console.log("\nFileNamw: " + file_name);
        // console.log("\nBuffer: " + obj.Body);
        return resolve(file_name);
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  });
};
