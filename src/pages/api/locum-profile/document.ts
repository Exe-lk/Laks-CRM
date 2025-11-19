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

          const fileExtension =
            file.originalFilename?.split(".").pop() || "pdf";
          const fileName = `${locumId}_${fieldName}_${Date.now()}.${fileExtension}`;
          const filePath = `${locumId}/${fileName}`;

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

          const { data: urlData } = supabase.storage
            .from("document")
            .getPublicUrl(filePath);

          updateData[fieldName] = urlData.publicUrl;
        } catch (error) {
          console.error(`Error processing ${fieldName}:`, error);
        }
      }
    }

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