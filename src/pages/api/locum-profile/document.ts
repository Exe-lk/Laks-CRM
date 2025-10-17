import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { supabase } from "../../../lib/supabase";
import { PrismaClient } from "@prisma/client";
import { Readable } from "stream";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadedFile {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

interface FormData {
  locumId: string;
  gdcImage?: UploadedFile;
  indemnityInsuranceImage?: UploadedFile;
  hepatitisBImage?: UploadedFile;
  dbsImage?: UploadedFile;
  referenceNumber?: UploadedFile;
  cv?: UploadedFile;
  idImage?: UploadedFile;
}

async function fileToBuffer(file: UploadedFile): Promise<Buffer> {
  const fs = require("fs");
  const buffer = fs.readFileSync(file.filepath);
  fs.unlinkSync(file.filepath);
  return buffer;
}

// Helper function to add delay between uploads
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry upload with exponential backoff
async function uploadWithRetry(
  filePath: string,
  fileBuffer: Buffer,
  mimetype: string,
  maxRetries: number = 3
): Promise<{ success: boolean; url?: string; error?: any }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("document")
        .upload(filePath, fileBuffer, {
          contentType: mimetype,
          cacheControl: "3600",
        });

      if (uploadError) {
        if (attempt === maxRetries) {
          return { success: false, error: uploadError };
        }
        // Wait before retrying (exponential backoff)
        await delay(1000 * attempt);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("document")
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      if (attempt === maxRetries) {
        return { success: false, error };
      }
      await delay(1000 * attempt);
    }
  }
  return { success: false, error: "Max retries exceeded" };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
      allowEmptyFiles: false,
      filter: (part) => {
        return part.mimetype !== undefined;
      },
    });

    const [fields, files] = await new Promise<
      [formidable.Fields, formidable.Files]
    >((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const locumId = fields.locumId?.[0] as string;

    if (!locumId) {
      return res.status(400).json({ error: "Locum ID is required" });
    }
    console.log(locumId);

    const existingProfile = await prisma.locumProfile.findUnique({
      where: { id: locumId },
    });
    console.log(existingProfile);

    if (!existingProfile) {
      return res.status(404).json({ error: "Locum profile not found" });
    }

    const updateData: any = {};
    const failedUploads: string[] = [];
    const documentFields = [
      "gdcImage",
      "indemnityInsuranceImage",
      "hepatitisBImage",
      "dbsImage",
      "cv",
      "idImage",
      "referenceletter1 ",
      "referenceletter2",
      "bankDetails",
      "shareCode",
      "NIUTRnumber",
    ];

    let fileIndex = 0;
    for (const fieldName of documentFields) {
      const file = files[fieldName]?.[0] as UploadedFile;

      if (file) {
        try {
          // Add a delay between uploads (except for the first one)
          if (fileIndex > 0) {
            await delay(800); // 800ms delay between each upload
          }
          fileIndex++;

          const fileBuffer = await fileToBuffer(file);

          const fileExtension =
            file.originalFilename?.split(".").pop() || "pdf";
          const fileName = `${locumId}_${fieldName}_${Date.now()}.${fileExtension}`;
          const filePath = `${locumId}/${fileName}`;

          console.log(`Uploading ${fieldName} (attempt ${fileIndex})...`);
          
          const uploadResult = await uploadWithRetry(
            filePath,
            fileBuffer,
            file.mimetype,
            3
          );

          if (uploadResult.success && uploadResult.url) {
            updateData[fieldName] = uploadResult.url;
            console.log(`✓ Successfully uploaded ${fieldName}`);
          } else {
            console.error(`✗ Failed to upload ${fieldName}:`, uploadResult.error);
            failedUploads.push(fieldName);
          }
        } catch (error) {
          console.error(`Error processing ${fieldName}:`, error);
          failedUploads.push(fieldName);
        }
      }
    }

    if (Object.keys(updateData).length > 0) {
      const updatedProfile = await prisma.locumProfile.update({
        where: { id: locumId },
        data: updateData,
      });

      const responseMessage = 
        failedUploads.length > 0
          ? `${Object.keys(updateData).length} documents uploaded successfully. ${failedUploads.length} failed.`
          : "All documents uploaded successfully";

      return res.status(200).json({
        message: responseMessage,
        profile: updatedProfile,
        uploadedDocuments: Object.keys(updateData),
        failedDocuments: failedUploads,
        status: 200,
        partialSuccess: failedUploads.length > 0,
      });
    } else {
      return res.status(400).json({ 
        error: "No valid documents were uploaded",
        failedDocuments: failedUploads,
      });
    }
  } catch (error) {
    console.error("Document upload error:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}