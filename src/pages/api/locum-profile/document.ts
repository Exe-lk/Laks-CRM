import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { supabase } from "../../../lib/supabase";
import { PrismaClient } from "@prisma/client";
import { Readable } from "stream";

const prisma = new PrismaClient();

// Disable the default body parser to handle file uploads
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

// Helper function to convert file to buffer without saving to disk
async function fileToBuffer(file: UploadedFile): Promise<Buffer> {
  const fs = require("fs");
  const buffer = fs.readFileSync(file.filepath);
  // Immediately delete the temporary file
  fs.unlinkSync(file.filepath);
  return buffer;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse form data with in-memory file handling
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      allowEmptyFiles: false,
      filter: (part) => {
        // Only process files, not text fields
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

    // Check if locum profile exists
    const existingProfile = await prisma.locumProfile.findUnique({
      where: { id: locumId },
    });
    console.log(existingProfile);

    if (!existingProfile) {
      return res.status(404).json({ error: "Locum profile not found" });
    }

    const updateData: any = {};
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

    for (const fieldName of documentFields) {
      const file = files[fieldName]?.[0] as UploadedFile;

      if (file) {
        try {
          const fileBuffer = await fileToBuffer(file);

          // Generate unique filename
          const fileExtension =
            file.originalFilename?.split(".").pop() || "pdf";
          const fileName = `${locumId}_${fieldName}_${Date.now()}.${fileExtension}`;
          // Save in a folder named after locumId
          const filePath = `${locumId}/${fileName}`;

          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("document")
              .upload(filePath, fileBuffer, {
                contentType: file.mimetype,
                cacheControl: "3600",
              });

          if (uploadError) {
            console.error(`Error uploading ${fieldName}:`, uploadError);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("document")
            .getPublicUrl(filePath);

          // Add to update data
          updateData[fieldName] = urlData.publicUrl;
        } catch (error) {
          console.error(`Error processing ${fieldName}:`, error);
          // Continue with other files even if one fails
        }
      }
    }

    // Update locum profile with document URLs
    if (Object.keys(updateData).length > 0) {
      const updatedProfile = await prisma.locumProfile.update({
        where: { id: locumId },
        data: updateData,
      });

      return res.status(200).json({
        message: "Documents uploaded successfully",
        profile: updatedProfile,
        uploadedDocuments: Object.keys(updateData),
        status: 200,
      });
    } else {
      return res
        .status(400)
        .json({ error: "No valid documents were uploaded" });
    }
  } catch (error) {
    console.error("Document upload error:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
