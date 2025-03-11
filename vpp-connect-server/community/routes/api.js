const express = require('express');
const router = express.Router();
const {
    db,
    admin
} = require('../../firebase/config');

// Function to generate a unique ID for the community
function generateUniqueID(communityName) {
    const transformedName = communityName.replace(/\s/g, '').toLowerCase();
    const id = transformedName + Math.random().toString(36).substr(2, 16);
    return id;
}

// Function to generate a unique ID
function generateUniqueID() {
    return Math.random().toString(36).substr(2, 16);
}

// Create a new community group
router.post('/create', async(req, res) => {
    const {
        name,
        type,
        createdBy,
        adminIds,
        memberIds
    } = req.body;
    const groupId = generateUniqueID(name);
    const createdAt = admin.firestore.Timestamp.now();

    try {
        await db.collection('community').doc(groupId).set({
            groupId,
            name,
            type,
            createdBy,
            adminIds,
            memberIds,
            createdAt
        });
        res.status(201).send({
            message: 'Community group created successfully',
            groupId
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error creating community group',
            error
        });
    }
});

// Get details of a community group by groupId
router.get('/:groupId', async(req, res) => {
    const {
        groupId
    } = req.params;

    try {
        const doc = await db.collection('community').doc(groupId).get();
        if (!doc.exists) {
            res.status(404).send({
                message: 'Community group not found'
            });
        } else {
            res.status(200).send(doc.data());
        }
    } catch (error) {
        res.status(500).send({
            message: 'Error fetching community group',
            error
        });
    }
});

// Update a community group's details
router.put('/:groupId', async(req, res) => {
    const {
        groupId
    } = req.params;
    const updates = req.body;

    try {
        await db.collection('community').doc(groupId).update(updates);
        res.status(200).send({
            message: 'Community group updated successfully'
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error updating community group',
            error
        });
    }
});

// Delete a community group
router.delete('/:groupId', async(req, res) => {
    const {
        groupId
    } = req.params;

    try {
        await db.collection('community').doc(groupId).delete();
        res.status(200).send({
            message: 'Community group deleted successfully'
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error deleting community group',
            error
        });
    }
});

// Add a member to a community group
router.post('/:groupId/addMember', async(req, res) => {
    const {
        groupId
    } = req.params;
    const {
        memberId
    } = req.body;

    try {
        const doc = await db.collection('community').doc(groupId).get();
        if (!doc.exists) {
            res.status(404).send({
                message: 'Community group not found'
            });
        } else {
            const memberIds = doc.data().memberIds || [];
            memberIds.push(memberId);
            await db.collection('community').doc(groupId).update({
                memberIds
            });
            res.status(200).send({
                message: 'Member added successfully'
            });
        }
    } catch (error) {
        res.status(500).send({
            message: 'Error adding member to community group',
            error
        });
    }
});

// Remove a member from a community group
router.post('/:groupId/removeMember', async(req, res) => {
    const {
        groupId
    } = req.params;
    const {
        memberId
    } = req.body;

    try {
        const doc = await db.collection('community').doc(groupId).get();
        if (!doc.exists) {
            res.status(404).send({
                message: 'Community group not found'
            });
        } else {
            const memberIds = doc.data().memberIds || [];
            const index = memberIds.indexOf(memberId);
            if (index > -1) {
                memberIds.splice(index, 1);
                await db.collection('community').doc(groupId).update({
                    memberIds
                });
                res.status(200).send({
                    message: 'Member removed successfully'
                });
            } else {
                res.status(404).send({
                    message: 'Member not found in community group'
                });
            }
        }
    } catch (error) {
        res.status(500).send({
            message: 'Error removing member from community group',
            error
        });
    }
});


router.post('/:groupId/groupMemberships', async(req, res) => {
    const {
        groupId
    } = req.params;
    const {
        userId,
        role
    } = req.body;

    if (!groupId || !userId || !role) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }
    try {
        const groupRef = db.collection('community').doc(groupId);
        const groupDoc = await groupRef.get();
        if (!groupDoc.exists) {
            return res.status(404).json({
                error: 'Community group not found'
            });
        }
        const groupData = groupDoc.data();
        const memberIds = groupData.memberIds || [];
        memberIds.push(userId);
        await groupRef.update({
            memberIds
        });
        return res.status(200).json({
            message: 'User added to community group successfully'
        });
    } catch (error) {
        console.error("Error adding user to community group:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Create a new group creation request
router.post('/:groupId/requests/create', async(req, res) => {
    const {
        requestedBy,
        groupName,
        type,
        reason
    } = req.body;
    const requestId = generateUniqueID();
    const createdAt = admin.firestore.Timestamp.now();
    const status = 'pending';

    try {
        await db.collection('community').doc(req.params.groupId).collection('group_creation_requests').doc(requestId).set({
            requestId,
            requestedBy,
            groupName,
            type,
            reason,
            status,
            createdAt
        });
        res.status(201).send({
            message: 'Group creation request submitted successfully',
            requestId
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error submitting group creation request',
            error
        });
    }
});

// Get details of a group creation request by requestId
router.get('/:groupId/requests/:requestId', async(req, res) => {
    const {
        groupId,
        requestId
    } = req.params;

    try {
        const doc = await db.collection('community').doc(groupId).collection('group_creation_requests').doc(requestId).get();
        if (!doc.exists) {
            res.status(404).send({
                message: 'Group creation request not found'
            });
        } else {
            res.status(200).send(doc.data());
        }
    } catch (error) {
        res.status(500).send({
            message: 'Error fetching group creation request',
            error
        });
    }
});

// Update a group creation request's status
router.put('/:groupId/requests/:requestId', async(req, res) => {
    const { groupId, requestId } = req.params;
    const { status, approvedBy } = req.body;

    try {
        const updates = { status };
        if (status === 'approved' && approvedBy) {
            updates.approvedBy = approvedBy;

            // Fetch the request details
            const requestDoc = await db.collection('community').doc(groupId).collection('group_creation_requests').doc(requestId).get();
            if (requestDoc.exists) {
                const requestData = requestDoc.data();
                const newGroupId = generateUniqueID(requestData.groupName);
                const createdAt = admin.firestore.Timestamp.now();

                // Create the new community group
                await db.collection('community').doc(newGroupId).set({
                    groupId: newGroupId,
                    name: requestData.groupName,
                    type: requestData.type,
                    createdBy: requestData.requestedBy,
                    adminIds: [requestData.requestedBy],
                    memberIds: [],
                    createdAt
                });
            }
        }
        await db.collection('community').doc(groupId).collection('group_creation_requests').doc(requestId).update(updates);
        res.status(200).send({
            message: 'Group creation request updated successfully'
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error updating group creation request',
            error
        });
    }
});

// Delete a group creation request
router.delete('/:groupId/requests/:requestId', async(req, res) => {
    const {
        groupId,
        requestId
    } = req.params;

    try {
        await db.collection('community').doc(groupId).collection('group_creation_requests').doc(requestId).delete();
        res.status(200).send({
            message: 'Group creation request deleted successfully'
        });
    } catch (error) {
        res.status(500).send({
            message: 'Error deleting group creation request',
            error
        });
    }
});

// Get a list of all community groups
router.get('/list-groups', async(req, res) => {
    try {
        const snapshot = await db.collection('community').get();
        if (snapshot.empty) {
            return res.status(404).send({
                message: 'No community groups found'
            });
        }

        const groups = snapshot.docs.map(doc => doc.data());
        res.status(200).send(groups);
    } catch (error) {
        res.status(500).send({
            message: 'Error fetching community groups',
            error
        });
    }
});


module.exports = router;