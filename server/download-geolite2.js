#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import { createWriteStream } from 'fs';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GeoLite2 City database URL (free version)
const GEOLITE2_URL = 'https://github.com/P3TERX/GeoLite.mmdb/raw/download/GeoLite2-City.mmdb';
const DB_PATH = path.join(__dirname, 'data', 'GeoLite2-City.mmdb');
const DATA_DIR = path.join(__dirname, 'data');

async function downloadDatabase() {
  console.log('Setting up GeoLite2 database...');

  // Create data directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Check if database already exists
  if (fs.existsSync(DB_PATH)) {
    console.log('GeoLite2 database already exists.');
    const stats = fs.statSync(DB_PATH);
    const ageInDays = (Date.now() - stats.mtime) / (1000 * 60 * 60 * 24);

    if (ageInDays < 30) {
      console.log(`Database is ${Math.floor(ageInDays)} days old. Skipping download.`);
      return;
    } else {
      console.log(`Database is ${Math.floor(ageInDays)} days old. Downloading update...`);
    }
  }

  // Download the database
  console.log('Downloading GeoLite2-City database...');

  return new Promise((resolve, reject) => {
    https.get(GEOLITE2_URL, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        https.get(response.headers.location, (redirectResponse) => {
          const fileStream = createWriteStream(DB_PATH);
          redirectResponse.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            console.log('GeoLite2 database downloaded successfully!');
            resolve();
          });

          fileStream.on('error', (err) => {
            fs.unlink(DB_PATH, () => {}); // Delete partial file
            reject(err);
          });
        });
      } else if (response.statusCode === 200) {
        const fileStream = createWriteStream(DB_PATH);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          console.log('GeoLite2 database downloaded successfully!');
          resolve();
        });

        fileStream.on('error', (err) => {
          fs.unlink(DB_PATH, () => {}); // Delete partial file
          reject(err);
        });
      } else {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  downloadDatabase().catch(console.error);
}

export { downloadDatabase };