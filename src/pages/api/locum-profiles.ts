import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all locum profiles
        const profiles = await prisma.locumProfile.findMany({
          orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(profiles)

      case 'POST':
        // Create a new locum profile
        const {
          fullName,
          emailAddress,
          contactNumber,
          address,
          password,
          gdcNumber,
          employeeType,
          software
        } = req.body

        // Basic validation
        if (!fullName || !emailAddress || !contactNumber || !address || !password || !gdcNumber || !employeeType) {
          return res.status(400).json({ 
            error: 'Missing required fields: fullName, emailAddress, contactNumber, address, password, gdcNumber, employeeType' 
          })
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: emailAddress,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName
          }
        })

        if (authError) {
          return res.status(400).json({ 
            error: `Authentication error: ${authError.message}` 
          })
        }

        // Create locum profile in database
        const newProfile = await prisma.locumProfile.create({
          data: {
            fullName,
            emailAddress,
            contactNumber,
            address,
            gdcNumber,
            employeeType,
            dateOfBirth: new Date('1990-01-01'), // Default date, you may want to handle this differently
            location: '', // Default empty string
            software: software || '',
            referenceNumber: `REF-${Date.now()}` // Auto-generate reference number
          }
        })

        return res.status(201).json({ 
          profile: newProfile, 
          authUser: authData.user 
        })

      case 'PUT':
        // Update a locum profile
        const { id, ...updateData } = req.body
        
        if (!id) {
          return res.status(400).json({ error: 'Profile ID is required' })
        }

        const updatedProfile = await prisma.locumProfile.update({
          where: { id },
          data: {
            ...updateData,
            dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined
          }
        })

        return res.status(200).json(updatedProfile)

      case 'DELETE':
        // Delete a locum profile
        const profileId = req.query.id as string
        
        if (!profileId) {
          return res.status(400).json({ error: 'Profile ID is required' })
        }

        await prisma.locumProfile.delete({
          where: { id: profileId }
        })

        return res.status(200).json({ message: 'Profile deleted successfully' })

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error:any) {
    console.error('API Error:', error)
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Email address already exists' 
      })
    }
    
    return res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
} 