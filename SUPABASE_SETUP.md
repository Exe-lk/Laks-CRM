# Supabase + Prisma Setup Guide

## 1. Database Connection Setup

Your `.env` file should contain the following variables for Supabase connection:

```env
# Supabase Database URLs
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### How to get your Supabase URLs:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string**
5. Copy the **Pooling** connection string for `DATABASE_URL`
6. Copy the **Direct** connection string for `DIRECT_URL`
7. Replace `[YOUR-PASSWORD]` with your database password
8. Replace `[YOUR-PROJECT-REF]` with your project reference ID

## 2. Apply Database Migration

Once your `.env` file is configured correctly, run:

```bash
npx prisma migrate dev --name init_locum_profile
```

This will create the `locum_profiles` table in your Supabase database.

## 3. Generate Prisma Client

If you make any changes to the schema, regenerate the client:

```bash
npx prisma generate
```

## 4. Using Prisma in Your Application

Import the Prisma client in your API routes or pages:

```typescript
import { prisma } from '@/lib/prisma'

// Example: Create a new locum profile
const newProfile = await prisma.locumProfile.create({
  data: {
    fullName: "John Doe",
    name: "John",
    address: "123 Main St",
    dateOfBirth: new Date("1990-01-01"),
    emailAddress: "john@example.com",
    contactNumber: "+1234567890",
    password: "hashedPassword",
    gdcNumber: "GDC123456",
    location: "London",
    employeeType: "Locum",
    software: "Software Name",
    referenceNumber: "REF001"
  }
})

// Example: Find all profiles
const profiles = await prisma.locumProfile.findMany()

// Example: Find profile by email
const profile = await prisma.locumProfile.findUnique({
  where: { emailAddress: "john@example.com" }
})
```

## 5. Schema Overview

The `LocumProfile` model includes:

- **Required fields**: fullName, name, address, dateOfBirth, emailAddress, contactNumber, password, gdcNumber, location, employeeType, software, referenceNumber
- **Optional fields**: gdcImage, indemnityInsuranceImage, hepatitisBImage, dbsImage, cv, idImage
- **Auto-generated**: id (CUID), createdAt, updatedAt

## 6. Troubleshooting

If you get a connection error:
1. Verify your database URLs in `.env`
2. Check your Supabase project is active
3. Ensure your IP is whitelisted in Supabase settings
4. Try using the direct URL for migrations

## 7. Next Steps

1. Fix your `.env` file with correct Supabase credentials
2. Run the migration: `npx prisma migrate dev --name init_locum_profile`
3. Start building your API endpoints using the Prisma client 