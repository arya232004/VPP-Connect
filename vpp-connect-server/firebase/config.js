const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Ensure you set this in .env
});

const db = admin.firestore();
// const bucket = admin.storage().bucket();

module.exports = { db, admin };