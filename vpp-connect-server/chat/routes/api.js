const express = require('express');
const router = express.Router();
const { db, admin } = require('../../firebase/config');

router.post('/groups', async(req, res) => {
    const { rooms } = req.body;

    // Check if the rooms parameter is provided and is an array.
    if (!rooms || !Array.isArray(rooms)) {
        return res.status(400).json({ error: 'rooms parameter is required and must be an array' });
    }

    try {
        // Use Firestore's "in" operator to query rooms whose document IDs are in the provided array.
        const groupsRef = db.collection('rooms')
            .where(admin.firestore.FieldPath.documentId(), 'in', rooms);
        const groupsSnapshot = await groupsRef.get();
        const groups = [];

        groupsSnapshot.forEach(doc => {
            groups.push({ id: doc.id, ...doc.data() });
        });

        return res.json({ groups });
    } catch (error) {
        console.error("Error retrieving groups:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;