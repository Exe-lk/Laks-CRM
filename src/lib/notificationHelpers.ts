import { PrismaClient } from '@prisma/client';
import { sendNotificationToUsers } from './fcmService';
import { NotificationType } from '@/types/notifications';

const prisma = new PrismaClient();

interface Coordinates {
  lat: number;
  lon: number;
}

function parseCoordinates(location: string): Coordinates | null {
  try {
    const parts = location.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lon = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
    }
  } catch (error) {
    console.error('Error parsing coordinates:', error);
  }
  return null;
}

async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('❌ [Geocode] Google Maps API key not configured');
      return null;
    }

    console.log(`🌍 [Geocode] Converting address to coordinates: "${address}"`);
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log(`✅ [Geocode] Address converted: ${location.lat}, ${location.lng}`);
      return { lat: location.lat, lon: location.lng };
    } else {
      console.error(`❌ [Geocode] Failed to geocode address. Status: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error('❌ [Geocode] Error geocoding address:', error);
    return null;
  }
}

async function getCoordinates(location: string): Promise<Coordinates | null> {
  // First try to parse as coordinates
  const coords = parseCoordinates(location);
  if (coords) {
    return coords;
  }
  
  // If not coordinates, try to geocode as address
  console.log(`📍 [Geocode] Location is not in coordinate format, attempting geocoding...`);
  return await geocodeAddress(location);
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function notifyNursesWithinRadius(
  appointmentLocation: string,
  requiredRole: string,
  appointmentData: {
    request_id: string;
    practice_name: string;
    request_date: Date;
    request_start_time: string;
  }
): Promise<void> {
  try {
    console.log(`🔔 [Radius] Notifying ${requiredRole}s within 35km of appointment ${appointmentData.request_id}`);
    console.log(`📍 [Radius] Appointment location: "${appointmentLocation}"`);

    const coords = await getCoordinates(appointmentLocation);
    if (!coords) {
      console.error(`❌ [Radius] Could not get coordinates for location: "${appointmentLocation}"`);
      console.error('   Tried parsing as coordinates and geocoding as address');
      return;
    }
    
    console.log(`✅ [Radius] Using coordinates: ${coords.lat}, ${coords.lon}`);

    const locums = await prisma.locumProfile.findMany({
      where: { employeeType: requiredRole },
      select: { id: true, location: true, address: true, fullName: true },
    });

    console.log(`📍 [Radius] Found ${locums.length} ${requiredRole}s in database`);

    if (locums.length === 0) {
      console.log('⚠️ [Radius] No locums found with this role');
      return;
    }

    const nearbyLocumsPromises = locums.map(async (locum) => {
      // Try address first (seems to be where coordinates are stored), then fallback to location
      let locumCoords = parseCoordinates(locum.address) || parseCoordinates(locum.location);
      
      // If neither field has coordinates, try geocoding the address field
      if (!locumCoords && locum.address) {
        console.log(`🔍 [Radius] Geocoding locum ${locum.fullName} address: "${locum.address}"`);
        locumCoords = await geocodeAddress(locum.address);
      }
      
      if (!locumCoords) {
        console.warn(`⚠️ [Radius] Locum ${locum.id} (${locum.fullName}) has no valid coordinates`);
        return null;
      }
      
      const distance = calculateDistance(
        coords.lat,
        coords.lon,
        locumCoords.lat,
        locumCoords.lon
      );
      console.log(`📍 [Radius] Locum ${locum.fullName}: distance = ${distance.toFixed(2)}km`);
      
      if (distance <= 35) {
        return locum;
      }
      return null;
    });
    
    const locumResults = await Promise.all(nearbyLocumsPromises);
    const nearbyLocums = locumResults.filter((locum): locum is NonNullable<typeof locum> => locum !== null);

    console.log(`📍 [Radius] ${nearbyLocums.length} within 35km`);

    if (nearbyLocums.length === 0) {
      console.log('⚠️ [Radius] No locums within 35km radius');
      return;
    }

    const locumIds = nearbyLocums.map((l) => l.id);
    const formattedDate = new Date(appointmentData.request_date).toLocaleDateString();

    await sendNotificationToUsers(locumIds, 'locum', {
      title: 'New Appointment Available',
      body: `${appointmentData.practice_name} posted a ${requiredRole} appointment on ${formattedDate} at ${appointmentData.request_start_time}`,
      data: {
        type: NotificationType.APPOINTMENT_POSTED,
        userType: 'locum',
        request_id: appointmentData.request_id,
        url: '/locumStaff/waitingList',
      },
    });
  } catch (error) {
    console.error('❌ [Radius] Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}