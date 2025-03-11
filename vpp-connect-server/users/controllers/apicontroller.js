const admin = require('firebase-admin');
const { db } = require('../../firebase/config');

async function createUser({ firstname, lastname, email, profilePic, userId }) {
    // Validate required fields
    if (!email || !firstname) {
        throw new Error('Missing required fields');
    }

    try {
        const userRef = db.collection('users').doc(userId ? userId : email);
        const userDoc = await userRef.get();

        // Check if user already exists
        if (userDoc.exists) {
            if (userDoc.data().role === "temp") {
                return { message: 'Please wait till the admin approves your request', user: userRef.id };
            }
            const existingUser = userDoc.data();
            console.log('User already exists:', existingUser);
            return { message: 'Logged in', user: userDoc.data() };

        } else {
            await userRef.set({
                fullname: `${firstname} ${lastname || ''}`,
                email,
                role: "temp",
                departmentId: null,
                classId: null,
                profilePic: profilePic || null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                rooms: [],
                microblogs: [],
                userId: userId
            }, { merge: true });

            return { message: 'Please wait till the admin approves your request', user: userRef.id };
        }
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error('Internal server error');
    }
}


async function getusername(userId) {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            return {
                username: userData.fullname,
                profilePic: userData.profilePic
            };
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Internal server error');
    }
}

async function getprofilepicture(userId) {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            return {
                profilePic: userData.profilePic
            };
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Internal server error');
    }
}

module.exports = { createUser, getusername, getprofilepicture };