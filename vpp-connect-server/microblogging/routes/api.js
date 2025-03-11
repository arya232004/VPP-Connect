const express = require('express');
const router = express.Router();
const { db, admin } = require('../../firebase/config');
const { getusername } = require('../../users/controllers/apicontroller');

// Create a new microblog post
router.post('/', async(req, res) => {
    try {
        const { userId, content, type } = req.body;
        if (!userId || !content) {
            return res.status(400).json({ error: 'Missing required fields: author and content' });
        }

        const newPost = {
            userId,
            content,
            type: type || 'text',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            likes: [] // Initially, no likes
        };

        const postRef = await db.collection('microblogs').add(newPost);

        // Add Post ID to the user's document
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            microblogs: admin.firestore.FieldValue.arrayUnion(postRef.id)
        });

        const postDoc = await postRef.get();
        res.status(201).json({ id: postRef.id, ...postDoc.data() });
    } catch (error) {
        console.error('Error creating microblog post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get microblog posts (latest first)
router.get('/', async(req, res) => {
    try {
        const snapshot = await db.collection('microblogs')
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        // Get all posts
        const posts = await Promise.all(snapshot.docs.map(async(doc) => {
            const postData = doc.data();

            // Get the username for the userId in each post
            const { username, profilePic } = await getusername(postData.userId);
            console.log(username);
            console.log(profilePic);

            // Return the post data with the username instead of the userId
            return {
                id: doc.id,
                ...postData,
                username,
                profilePic
                // Add the fetched username
            };
        }));

        // Log and send the updated posts
        console.log(posts);
        res.status(200).json(posts);

    } catch (error) {
        console.error('Error fetching microblog posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Like a post
router.post('/:id/like', async(req, res) => {
    console.log("like");
    try {
        const postId = req.params.id;
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'Missing required field: userId' });
        }

        await db.collection('microblogs').doc(postId).update({
            likes: admin.firestore.FieldValue.arrayUnion(userId)
        });

        res.status(200).json({ message: 'Post liked successfully' });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Unlike a post
router.post('/:id/unlike', async(req, res) => {
    try {
        const postId = req.params.id;
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'Missing required field: userId' });
        }

        await db.collection('microblogs').doc(postId).update({
            likes: admin.firestore.FieldValue.arrayRemove(userId)
        });

        res.status(200).json({ message: 'Post unliked successfully' });
    } catch (error) {
        console.error('Error unliking post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:postid', async(req, res) => {
    const postId = req.params.postid;
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'Missing required field: userId' });
    }
    try {
        await db.collection('microblogs').doc(postId).delete();
        await db.collection('users').doc(userId).update({
            microblogs: admin.firestore.FieldValue.arrayRemove(postId)
        });
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

});

module.exports = router;