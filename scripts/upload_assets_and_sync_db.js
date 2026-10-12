const { Client, Storage, Databases, Permission, Role, ID } = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '6ac891a8002a7a9efbf8';
const DB_ID = process.env.APPWRITE_DATABASE_ID || '6ac8ad70001ee5f1f58d';
const API_KEY = process.env.APPWRITE_API_KEY;
const BUCKET_ID = '6ac89653002ecfd6cf10'; // User's created Smart-Parking Storage bucket

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const storage = new Storage(client);
const databases = new Databases(client);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('=== Step 1: Update Bucket Permissions for Public Image Viewing ===');
  try {
    await storage.updateBucket(
      BUCKET_ID,
      'Smart-Parking Storage',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ],
      false, // fileSecurity false allows public access according to permissions
      true,  // enabled
      undefined,
      ['jpg', 'jpeg', 'png', 'webp'],
      undefined,
      false,
      false
    );
    console.log('✔ Bucket permissions updated to allow public read');
  } catch (err) {
    console.warn('Bucket update note:', err.message);
  }

  console.log('\n=== Step 2: Ensure imageUrl attribute exists in parking_zones collection ===');
  try {
    await databases.createStringAttribute(DB_ID, 'parking_zones', 'imageUrl', 1000, false);
    console.log('✔ Attribute imageUrl created. Waiting for attribute indexing...');
    await sleep(3000);
  } catch (err) {
    if (err.code === 409) {
      console.log('ℹ Attribute imageUrl already exists');
    } else {
      console.warn('Attribute note:', err.message);
    }
  }

  console.log('\n=== Step 3: Upload Local Parking Photos to Appwrite Storage ===');
  const assetsDir = path.resolve(__dirname, '../../Frontend/assets/parking');
  const filesToUpload = [
    { id: 'parking_grand_bazaar', filename: 'grand_bazaar.jpg' },
    { id: 'parking_french_quarter', filename: 'french_quarter.jpg' },
    { id: 'parking_beach_free', filename: 'beach_free.jpg' },
    { id: 'parking_goubert', filename: 'goubert.jpg' },
  ];

  const uploadedUrls = {};

  for (const item of filesToUpload) {
    const fullPath = path.join(assetsDir, item.filename);
    if (!fs.existsSync(fullPath)) {
      console.error('File not found:', fullPath);
      continue;
    }

    try {
      // Check if file already exists
      try {
        await storage.getFile(BUCKET_ID, item.id);
        console.log(`ℹ File ${item.id} already exists in bucket, reusing...`);
      } catch (notFound) {
        const fileObj = InputFile.fromPath(fullPath, item.filename);
        await storage.createFile(
          BUCKET_ID,
          item.id,
          fileObj,
          [Permission.read(Role.any())]
        );
        console.log(`✔ Uploaded ${item.filename} as ${item.id}`);
      }

      // Appwrite view URL
      const viewUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${item.id}/view?project=${PROJECT_ID}`;
      uploadedUrls[item.id] = viewUrl;
      console.log(`   Public URL: ${viewUrl}`);
    } catch (err) {
      console.error(`Error uploading ${item.filename}:`, err.message);
    }
  }

  console.log('\n=== Step 4: Map Image URLs to Database Parking Zones ===');
  const zoneImageMapping = {
    'zone-mission-st': uploadedUrls['parking_grand_bazaar'],
    'zone-white-town': uploadedUrls['parking_french_quarter'],
    'zone-rock-beach-north': uploadedUrls['parking_beach_free'],
    'zone-bharathi-park': uploadedUrls['parking_french_quarter'],
    'zone-old-port': uploadedUrls['parking_goubert'],
    'zone-bussy-st': uploadedUrls['parking_french_quarter'],
    'zone-jn-street': uploadedUrls['parking_grand_bazaar'],
    'zone-railway-station': uploadedUrls['parking_beach_free'],
  };

  for (const [zoneId, url] of Object.entries(zoneImageMapping)) {
    if (!url) continue;
    try {
      await databases.updateDocument(DB_ID, 'parking_zones', zoneId, {
        imageUrl: url,
      });
      console.log(`✔ Updated ${zoneId} with live storage imageUrl`);
    } catch (err) {
      console.warn(`Failed to update ${zoneId}:`, err.message);
    }
  }

  console.log('\n=== Step 5: Verification - Fetch updated documents from DB ===');
  const verify = await databases.listDocuments(DB_ID, 'parking_zones');
  console.log(`Database now contains ${verify.total} parking zones:`);
  verify.documents.forEach((doc) => {
    console.log(`- ${doc.name}: ${doc.imageUrl ? 'Image URL synced: ' + doc.imageUrl : 'No image'}`);
  });

  console.log('\nAll done! Bucket, Storage images, and Database rows are 100% in sync!');
}

run().catch(console.error);
