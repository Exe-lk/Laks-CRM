import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

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
          name,
          address,
          dateOfBirth,
          emailAddress,
          contactNumber,
          password,
          gdcNumber,
          location,
          employeeType,
          software,
          referenceNumber,
          gdcImage,
          indemnityInsuranceImage,
          hepatitisBImage,
          dbsImage,
          cv,
          idImage
        } = req.body

        // Basic validation
        if (!fullName || !emailAddress || !contactNumber) {
          return res.status(400).json({ 
            error: 'Missing required fields: fullName, emailAddress, contactNumber' 
          })
        }

        const newProfile = await prisma.locumProfile.create({
          data: {
            fullName,
            name,
            address,
            dateOfBirth: new Date(dateOfBirth),
            emailAddress,
            contactNumber,
            password, // Remember to hash this in production!
            gdcNumber,
            location,
            employeeType,
            software,
            referenceNumber,
            gdcImage,
            indemnityInsuranceImage,
            hepatitisBImage,
            dbsImage,
            cv,
            idImage
          }
        })

        return res.status(201).json(newProfile)

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