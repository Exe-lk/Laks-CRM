import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { supabase } from "@/lib/supabase";
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Disable body parser to handle file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry upload with exponential backoff
async function uploadSignatureWithRetry(
  filePath: string,
  fileBuffer: Buffer,
  mimetype: string,
  maxRetries: number = 3
): Promise<{ success: boolean; publicUrl?: string; error?: any }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(filePath, fileBuffer, {
          contentType: mimetype || 'image/png',
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload attempt ${attempt} failed:`, uploadError);
        if (attempt === maxRetries) {
          return { success: false, error: uploadError };
        }
        // Wait before retrying (exponential backoff)
        await delay(1000 * attempt);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath);

      return { success: true, publicUrl };
    } catch (error) {
      console.error(`Upload attempt ${attempt} exception:`, error);
      if (attempt === maxRetries) {
        return { success: false, error };
      }
      await delay(1000 * attempt);
    }
  }
  return { success: false, error: "Max retries exceeded" };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }

    // Parse form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB max
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    const timesheetId = fields.timesheetId?.[0];
    const signatureType = fields.signatureType?.[0]; 

    if (!timesheetId || !signatureType) {
      return res.status(400).json({ error: "Missing timesheetId or signatureType" });
    }

    if (signatureType !== 'staff' && signatureType !== 'manager') {
      return res.status(400).json({ error: "Invalid signatureType. Must be 'staff' or 'manager'" });
    }

    // Check if timesheet exists
    const timesheet = await prisma.timesheet.findUnique({
      where: { id: timesheetId },
    });

    if (!timesheet) {
      return res.status(404).json({ error: "Timesheet not found" });
    }

    // Get the uploaded file
    const signatureFile = files.signature?.[0];
    if (!signatureFile) {
      return res.status(400).json({ error: "No signature file provided" });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(signatureFile.mimetype || '')) {
      return res.status(400).json({ error: "Invalid file type. Only image files are allowed" });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(signatureFile.filepath);
    const fileExt = path.extname(signatureFile.originalFilename || '.png');
    const fileName = `timesheet_${timesheetId}_${signatureType}_signature_${Date.now()}${fileExt}`;
    const filePath = `timesheet-signatures/${fileName}`;

    console.log(`Uploading ${signatureType} signature for timesheet ${timesheetId}...`);

    // Upload to Supabase Storage with retry logic
    const uploadResult = await uploadSignatureWithRetry(
      filePath,
      fileBuffer,
      signatureFile.mimetype || 'image/png',
      3
    );

    // Clean up temporary file
    fs.unlinkSync(signatureFile.filepath);

    if (!uploadResult.success || !uploadResult.publicUrl) {
      console.error('Failed to upload signature after retries:', uploadResult.error);
      return res.status(500).json({ 
        error: "Failed to upload signature to storage",
        details: uploadResult.error 
      });
    }

    console.log(`✓ Successfully uploaded ${signatureType} signature`);
    const publicUrl = uploadResult.publicUrl;

    res.status(200).json({
      success: true,
      data: {
        signatureUrl: publicUrl,
        fileName: fileName,
        filePath: filePath,
      },
      message: "Signature uploaded successfully"
    });

  } catch (error) {
    console.error("Upload signature error:", error);
    res.status(500).json({ error: "Failed to upload signature" });
  }
}
