import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import formidable from 'formidable';
import { promises as fs } from 'fs';

interface UploadedFile {
  filepath: string;
  originalFilename?: string;
  mimetype: string;
  size: number;
}

async function fileToBuffer(file: UploadedFile): Promise<Buffer> {
  const buffer = await fs.readFile(file.filepath);
  return buffer;
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

    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      allowEmptyFiles: false,
      filter: (part) => {
        // Only allow image files
        return part.mimetype?.startsWith('image/') || false;
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

    const { timesheetId, signatureType } = fields;
    const signatureFile = files.signature?.[0] as UploadedFile;

    if (!timesheetId || !signatureType || !signatureFile) {
      return res.status(400).json({ 
        error: "timesheetId, signatureType, and signature file are required" 
      });
    }

    if (!['staff', 'manager'].includes(signatureType as string)) {
      return res.status(400).json({ 
        error: "signatureType must be 'staff' or 'manager'" 
      });
    }

    try {
      const fileBuffer = await fileToBuffer(signatureFile);
      
      // Generate unique filename
      const fileExtension = signatureFile.originalFilename?.split('.').pop() || 'png';
      const fileName = `${timesheetId}_${signatureType}_signature_${Date.now()}.${fileExtension}`;
      const filePath = `timesheet-signatures/${fileName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(filePath, fileBuffer, {
          contentType: signatureFile.mimetype,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('Error uploading signature:', uploadError);
        return res.status(500).json({ 
          error: "Failed to upload signature image" 
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath);

      // Clean up temporary file
      await fs.unlink(signatureFile.filepath);

      res.status(200).json({
        success: true,
        data: {
          signatureUrl: urlData.publicUrl,
          fileName: fileName,
          filePath: filePath
        },
        message: "Signature uploaded successfully"
      });

    } catch (error) {
      console.error('Error processing signature upload:', error);
      return res.status(500).json({ 
        error: "Failed to process signature upload" 
      });
    }

  } catch (error) {
    console.error("Upload signature error:", error);
    res.status(500).json({ error: "Failed to upload signature" });
  }
}

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
