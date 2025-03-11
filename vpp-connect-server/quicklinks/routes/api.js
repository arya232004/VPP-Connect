const admin = require('firebase-admin');
const { db } = require('../../firebase/config');
const express = require('express');
const router = express.Router();

router.post('/', async(req, res) => {
    const { linkname, linkurl, userId } = req.body;
    if (!linkname || !linkurl) {
        return res.status(400).json({ error: 'Missing required fields: linkname and linkurl' });
    }

    try {
        const newLink = {
            linkname,
            linkurl
        };

        const docRef = db.collection('quicklinks').doc(userId);

        // Check if the document exists
        const docSnapshot = await docRef.get();

        if (docSnapshot.exists) {
            // If the document exists, update it with the new quicklink
            await docRef.update({
                quicklinks: admin.firestore.FieldValue.arrayUnion(newLink)
            });
        } else {
            // If the document doesn't exist, create it with the new quicklink
            await docRef.set({
                quicklinks: [newLink]
            });
        }

        res.status(200).json({ message: 'Quicklink created successfully', id: docRef.id, ...newLink });
    } catch (error) {
        console.error('Error creating quicklink:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/:userid', async(req, res) => {
    try {
        const userId = req.params.userid;
        const docRef = db.collection('quicklinks').doc(userId);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Quicklinks not found' });
        }
        const quicklinks = doc.data();
        res.status(200).json(quicklinks);
    } catch (error) {
        console.error('Error fetching quicklinks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;