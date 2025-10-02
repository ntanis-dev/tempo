import fs from 'fs';
import path from 'path';
import { Reader } from 'mmdb-lib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'data', 'GeoLite2-City.mmdb');
let reader = null;
let isInitialized = false;

// Initialize the database reader
function initializeReader() {
  if (isInitialized) return;

  try {
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      reader = new Reader(buffer);
      isInitialized = true;
      console.log('GeoIP database loaded successfully');
    } else {
      console.warn('GeoIP database not found. Run: npm run setup-geo');
    }
  } catch (error) {
    console.error('Failed to load GeoIP database:', error.message);
  }
}

// Get location from IP address
export function getLocationFromIP(ip) {
  // Initialize on first use
  if (!isInitialized) {
    initializeReader();
  }

  if (!reader) {
    return 'Unknown';
  }

  try {
    // Handle local/private IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') ||
        ip.startsWith('10.') || ip.startsWith('172.')) {
      return 'Local';
    }

    // Handle IPv6 mapped IPv4
    if (ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }

    const result = reader.get(ip);

    if (!result) {
      return 'Unknown';
    }

    const parts = [];

    // City
    if (result.city && result.city.names && result.city.names.en) {
      parts.push(result.city.names.en);
    }

    // Country or State
    if (result.subdivisions && result.subdivisions[0] && result.subdivisions[0].iso_code) {
      parts.push(result.subdivisions[0].iso_code);
    } else if (result.country && result.country.iso_code) {
      parts.push(result.country.iso_code);
    }

    // Return formatted location
    return parts.length > 0 ? parts.join(', ') : 'Unknown';

  } catch (error) {
    console.error('Error looking up IP:', ip, error.message);
    return 'Unknown';
  }
}

// Get more detailed location info
export function getDetailedLocationFromIP(ip) {
  if (!isInitialized) {
    initializeReader();
  }

  if (!reader) {
    return null;
  }

  try {
    // Handle local IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') ||
        ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        city: 'Local',
        country: 'Network',
        countryCode: 'LAN',
        region: null,
        latitude: null,
        longitude: null
      };
    }

    // Handle IPv6 mapped IPv4
    if (ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }

    const result = reader.get(ip);

    if (!result) {
      return null;
    }

    return {
      city: result.city?.names?.en || null,
      country: result.country?.names?.en || null,
      countryCode: result.country?.iso_code || null,
      region: result.subdivisions?.[0]?.names?.en || null,
      regionCode: result.subdivisions?.[0]?.iso_code || null,
      latitude: result.location?.latitude || null,
      longitude: result.location?.longitude || null,
      timezone: result.location?.time_zone || null
    };

  } catch (error) {
    console.error('Error getting detailed location:', error.message);
    return null;
  }
}

// Initialize on module load
initializeReader();