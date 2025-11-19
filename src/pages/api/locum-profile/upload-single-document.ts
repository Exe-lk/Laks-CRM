import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { supabase } from "../../../lib/supabase";
import { PrismaClient } from "@prisma/client";
import { Readable } from "stream";
import { applyCors } from "@/lib/api-cors";

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

async function fileToBuffer(file: UploadedFile): Promise<Buffer> {
  const fs = require("fs");
  const buffer = fs.readFileSync(file.filepath);
  fs.unlinkSync(file.filepath);
  return buffer;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(applyCors(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB max
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
    const fieldName = fields.fieldName?.[0] as string;

    if (!locumId || !fieldName) {
      return res.status(400).json({ 
        error: "Locum ID and field name are required" 
      });
    }

    // Validate field name
    const allowedFields = [
      "gdcImage",
      "indemnityInsuranceImage", 
      "hepatitisBImage",
      "dbsImage",
      "cv",
      "idImage",
      "referenceletter1",
      "referenceletter2",
      "bankDetails",
      "shareCode",
      "NIUTRnumber",
    ];

    if (!allowedFields.includes(fieldName)) {
      return res.status(400).json({ 
        error: `Invalid field name. Allowed fields: ${allowedFields.join(', ')}` 
      });
    }

    // Check if locum profile exists
    const existingProfile = await prisma.locumProfile.findUnique({
      where: { id: locumId },
    });

    if (!existingProfile) {
      return res.status(404).json({ error: "Locum profile not found" });
    }

    // Get the uploaded file
    const file = files.file?.[0] as UploadedFile;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}` 
      });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ 
        error: "File size exceeds 10MB limit" 
      });
    }

    try {
      const fileBuffer = await fileToBuffer(file);

      const fileExtension = file.originalFilename?.split(".").pop() || "pdf";
      const fileName = `${locumId}_${fieldName}_${Date.now()}.${fileExtension}`;
      const filePath = `${locumId}/${fileName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("document")
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype,
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error(`Error uploading ${fieldName}:`, uploadError);
        return res.status(500).json({ 
          error: `Failed to upload file: ${uploadError.message}` 
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("document")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        return res.status(500).json({ 
          error: "Failed to get file URL" 
        });
      }

      // Update database with the new file URL
      const updateData = { [fieldName]: urlData.publicUrl };
      
      const updatedProfile = await prisma.locumProfile.update({
        where: { id: locumId },
        data: updateData,
      });

      return res.status(200).json({
        message: "File uploaded successfully",
        fieldName,
        fileName: file.originalFilename,
        fileUrl: urlData.publicUrl,
        fileSize: file.size,
        profile: updatedProfile,
        status: 200,
      });

    } catch (error) {
      console.error(`Error processing ${fieldName}:`, error);
      return res.status(500).json({ 
        error: `Failed to process file: ${(error as Error).message}` 
      });
    }

  } catch (error) {
    console.error("Document upload error:", error);
    return res.status(500).json({ 
      error: "Internal server error" 
    });
  } finally {
    await prisma.$disconnect();
  }
}
