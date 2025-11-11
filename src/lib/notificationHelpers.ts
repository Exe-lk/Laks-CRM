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
    console.log(`🔔 [Radius] Notifying ${requiredRole}s within 30km of appointment ${appointmentData.request_id}`);

    const coords = parseCoordinates(appointmentLocation);
    if (!coords) {
      console.error(`❌ [Radius] Invalid location format: "${appointmentLocation}"`);
      console.error('   Expected format: "latitude,longitude" (e.g., "51.5074,-0.1278")');
      return;
    }

    const locums = await prisma.locumProfile.findMany({
      where: { employeeType: requiredRole },
      select: { id: true, location: true, fullName: true },
    });

    console.log(`📍 [Radius] Found ${locums.length} ${requiredRole}s in database`);

    if (locums.length === 0) {
      console.log('⚠️ [Radius] No locums found with this role');
      return;
    }

    const nearbyLocums = locums.filter((locum) => {
      const locumCoords = parseCoordinates(locum.location);
      if (!locumCoords) return false;
      const distance = calculateDistance(
        coords.lat,
        coords.lon,
        locumCoords.lat,
        locumCoords.lon
      );
      return distance <= 30;
    });

    console.log(`📍 [Radius] ${nearbyLocums.length} within 30km`);

    if (nearbyLocums.length === 0) {
      console.log('⚠️ [Radius] No locums within 30km radius');
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