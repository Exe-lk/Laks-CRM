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

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('signatures')
      .upload(filePath, fileBuffer, {
        contentType: signatureFile.mimetype || 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ error: "Failed to upload signature to storage" });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('signatures')
      .getPublicUrl(filePath);

    // Clean up temporary file
    fs.unlinkSync(signatureFile.filepath);

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
