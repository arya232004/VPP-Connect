// controllers/googleAuthController.js
const { OAuth2Client } = require('google-auth-library');
const { db } = require('../../firebase/config'); // Adjust path as necessary
const admin = require('firebase-admin');
const { createUser } = require('../../users/controllers/apicontroller'); // Adjust path as necessary

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async(req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ error: 'idToken is required' });
    }

    try {
        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log('Google login payload:', payload);
        // Extract profile details from the token payload
        const { sub: googleId, name, given_name, family_name, email, picture } = payload;

        // Construct a user object
        const userData = {
            firstname: given_name,
            lastname: family_name,
            email: email,
            profilePic: picture,
            userId: googleId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const user = await createUser(userData);
        if (user.message === 'User already exists') {
            return res.status(200).json({ message: 'User logged in successfully', user: user.user });
        } else {
            return res.status(200).json({ message: user.message, user: user.user });
        }

    } catch (error) {
        console.error('Error during Google login:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};