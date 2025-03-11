const express = require('express');
const router = express.Router();
const { db, admin } = require('../../firebase/config');
const { addUserToRoomDB } = require('../../chat/socket/config');
const axios = require('axios');

router.post('/updateuser', async(req, res) => {
    const { userId, updates } = req.body;

    if (!userId || !updates) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { fullname } = userDoc.data();

        // Update user's details
        await userRef.update(updates);

        // Initialize array to collect room IDs to add to the user document
        const roomIds = [];

        // If departmentId is provided, add user to the department room.
        if (updates.departmentId) {
            const deptSnapshot = await db.collection('departments').doc(updates.departmentId).get();
            if (!deptSnapshot.exists) {
                return res.status(404).json({ error: 'Department not found' });
            }
            const deptData = deptSnapshot.data();
            const deptRoomId = deptData.deptRoomId;
            await addUserToRoomDB({ roomId: deptRoomId, userId, name: fullname });
            roomIds.push(deptRoomId);

            // For non-student roles, add them to all department classes
            if (updates.role !== 'student' && deptData.classes && Array.isArray(deptData.classes)) {
                for (const classId of deptData.classes) {
                    const classSnapshot = await db.collection('classes').doc(classId).get();
                    if (classSnapshot.exists) {
                        const classData = classSnapshot.data();
                        const classRoomId = classData.roomData;
                        await addUserToRoomDB({ roomId: classRoomId, userId, name: fullname });
                        roomIds.push(classRoomId);
                    }
                }
            }
        }

        // If the user is a student, only add them to the specific class provided.
        if (updates.role === 'student' && updates.classId) {
            const classSnapshot = await db.collection('classes').doc(updates.classId).get();
            if (classSnapshot.exists) {
                const classData = classSnapshot.data();
                const classRoomId = classData.roomData;
                await addUserToRoomDB({ roomId: classRoomId, userId, name: fullname });
                roomIds.push(classRoomId);

                // Add user's ID to studentIds field in the class document
                await classSnapshot.ref.update({ studentIds: admin.firestore.FieldValue.arrayUnion(userId) });
            }
        }

        // Update the user document with the collected room IDs.
        await userRef.update({ rooms: admin.firestore.FieldValue.arrayUnion(...roomIds) });

        return res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/getuser/:userId", async(req, res) => {
    const { userId } = req.params;

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userData = userDoc.data();
        return res.status(200).json(userData);
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// get all users in a department
router.get("/department/:departmentId", async(req, res) => {
    const { departmentId } = req.params;

    try {
        const usersSnapshot = await db.collection('users').where('departmentId', '==', departmentId).get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push(doc.data());
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// get all users in a class
router.get("/class/:classId", async(req, res) => {
    const { classId } = req.params;

    try {
        const usersSnapshot = await db.collection('users').where('classId', '==', classId).get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push(doc.data());
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// get all users in a group
router.get("/group/:groupId", async(req, res) => {
    const { groupId } = req.params;

    try {
        const usersSnapshot = await db.collection('users').where('groupId', '==', groupId).get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push(doc.data());
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/profile", async(req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).send("Missing URL");

        const response = await axios.get(url, { responseType: "stream" });

        res.setHeader("Content-Type", response.headers["content-type"]);
        response.data.pipe(res);
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        res.status(500).send("Error fetching image");
    }
});

router.get("/allusers", async(req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push(doc.data());
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/allstudents", async(req, res) => {
    try {
        const usersSnapshot = await db.collection('users').where('role', '==', 'student').get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push(doc.data());
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/allfaculty", async(req, res) => {
    try {
        const usersSnapshot = await db.collection('users').where('role', '==', 'faculty').get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push(doc.data());
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// all students in a department
router.get("/students/:departmentId", async(req, res) => {
    const { departmentId } = req.params;

    try {
        const usersSnapshot = await db.collection('users').where('role', '==', 'student').where('departmentId', '==', departmentId).get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push(doc.data());
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// all faculty in a department
router.get("/faculty/:departmentId", async(req, res) => {
    const { departmentId } = req.params;

    try {
        const usersSnapshot = await db.collection('users').where('role', '==', 'faculty').where('departmentId', '==', departmentId).get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push(doc.data());
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;