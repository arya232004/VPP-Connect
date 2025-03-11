const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
    uploadFile,
    getFileThumbnail,
    getFileUrl,
} = require("../../drive/controllers/apicontroller.js");
const { db, admin } = require("../../firebase/config");
const { sendemail } = require("../../notification/controllers/apicontroller.js");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to generate a unique ID for the announcement
function generateUniqueID() {
    return Math.random().toString(36).substr(2, 16);
}

const getTargetCollection = (level) => {
    const collections = {
        department: "departments",
        class: "classes",
        community: "communities",
    };
    return collections[level] || null;
};

async function getusersemail(level) {
    const snapshot = await db.collection("users").where("departmentId", "==", level || "classId", "==", level).get();
    if (snapshot.empty) return [];
    const users = snapshot.docs.map((doc) => doc.data());
    const emails = users.map((user) => user.email);
    return emails;
}

// console.log(await getusersemail("department"));


// Create a new announcement
router.post("/create", upload.single("file"), async(req, res) => {
    const { level, targetId, postedBy, content, category, title } = req.body;
    const file = req.file;
    const announcementId = generateUniqueID();
    const timestamp = admin.firestore.Timestamp.now();

    try {
        let fileId = null;
        if (file) {
            fileId = await uploadFile("announcements", file.originalname, file.buffer);
        }
        await db.collection("announcements").doc(announcementId).set({
            announcementId,
            level,
            targetId: targetId === undefined ? null : targetId,
            postedBy,
            content,
            category,
            fileId,
            title,
            timestamp,
        });

        let studentEmails = [];

        // Determine recipients based on level
        if (level === "department" && targetId) {
            // Fetch the department document and its studentIds array
            const deptDocRef = db.collection("departments").doc(targetId);
            const deptDoc = await deptDocRef.get();
            if (!deptDoc.exists) {
                console.error("Department not found for targetId:", targetId);
            } else {
                const deptData = deptDoc.data();
                const studentIds = deptData.studentIds || [];
                // Fetch student emails based on the studentIds
                const studentPromises = studentIds.map(async studentId => {
                    const userDoc = await db.collection("users").doc(studentId).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        return userData.email;
                    }
                    return null;
                });
                const emails = await Promise.all(studentPromises);
                studentEmails = emails.filter(email => email);
            }
        } else if (level === "class" && targetId) {
            // Fetch the class document and its studentIds array
            const classDocRef = db.collection("classes").doc(targetId);
            const classDoc = await classDocRef.get();
            if (!classDoc.exists) {
                console.error("Class not found for targetId:", targetId);
            } else {
                const classData = classDoc.data();
                const studentIds = classData.studentIds || [];
                // Fetch student emails based on the studentIds
                const studentPromises = studentIds.map(async studentId => {
                    const userDoc = await db.collection("users").doc(studentId).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        return userData.email;
                    }
                    return null;
                });
                const emails = await Promise.all(studentPromises);
                studentEmails = emails.filter(email => email);
            }
        } else if (level === "college") {
            // Query all users with role "student"
            const usersSnapshot = await db.collection("users")
                .where("role", "==", "student")
                .get();
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                if (userData.email) {
                    studentEmails.push(userData.email);
                }
            });
        }

        // Prepare the email details
        const subject = "New Announcement Posted";
        const message = `<p>A new announcement titled "<strong>${title}</strong>" has been posted. Please check the portal for details.</p>`;

        // Send email notifications concurrently
        const emailPromises = studentEmails.map(email => sendemail(email, subject, message));
        await Promise.all(emailPromises);

        res.status(201).send({ message: "Announcement created and emails sent successfully", announcementId });
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).send({ message: "Error creating announcement", error });
    }
});


// Get details of an announcement by announcementId
router.get("/get/:announcementId", async(req, res) => {
    const { announcementId } = req.params;

    try {
        const doc = await db.collection("announcements").doc(announcementId).get();
        if (!doc.exists) {
            return res.status(404).send({ message: "Announcement not found" });
        }

        let announcementData = doc.data();

        // Fetch thumbnail, user details, and target details in parallel
        const thumbnailPromise = announcementData?.fileId ?
            getFileThumbnail(announcementData.fileId) :
            Promise.resolve(null);
        const userPromise = announcementData?.postedBy ?
            db.collection("users").doc(announcementData.postedBy).get() :
            Promise.resolve(null);
        const targetCollection = getTargetCollection(announcementData.level);
        const targetPromise =
            targetCollection && announcementData.targetId ?
            db.collection(targetCollection).doc(announcementData.targetId).get() :
            Promise.resolve(null);

        const [thumbnailUrl, userDoc, targetDoc] = await Promise.all([
            thumbnailPromise,
            userPromise,
            targetPromise,
        ]);

        if (thumbnailUrl) announcementData.thumbnailUrl = thumbnailUrl;
        if (userDoc?.exists) announcementData.postedByInfo = userDoc.data();
        if (targetDoc?.exists) announcementData.targetInfo = targetDoc.data();

        res.status(200).send(announcementData);
    } catch (error) {
        console.error("Error fetching announcement:", error);
        res.status(500).send({ message: "Error fetching announcement", error });
    }
});

// Update an announcement's details
router.put("/update/:announcementId", async(req, res) => {
    const { announcementId } = req.params;
    const updates = req.body;

    try {
        await db.collection("announcements").doc(announcementId).update(updates);
        res.status(200).send({ message: "Announcement updated successfully" });
    } catch (error) {
        console.error("Error updating announcement:", error);
        res.status(500).send({ message: "Error updating announcement", error });
    }
});

// Delete an announcement
router.delete("/delete/:announcementId", async(req, res) => {
    const { announcementId } = req.params;

    try {
        await db.collection("announcements").doc(announcementId).delete();
        res.status(200).send({ message: "Announcement deleted successfully" });
    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).send({ message: "Error deleting announcement", error });
    }
});

// Get announcements by level
router.get("/level/:level", async(req, res) => {
    const { level } = req.params;
    const { targetId } = req.query;

    try {
        let query = db.collection("announcements").where("level", "==", level);
        if (level !== "college") query = query.where("targetId", "==", targetId);

        const snapshot = await query.get();
        if (snapshot.empty) return res.status(200).send([]);

        const announcements = snapshot.docs.map((doc) => doc.data());
        const userIds = [...new Set(announcements.map((a) => a.postedBy))];
        const targetIds = [
            ...new Set(announcements.map((a) => a.targetId).filter(Boolean)),
        ];
        const fileIds = announcements.map((a) => a.fileId).filter(Boolean);

        const userDocs = await Promise.all(
            userIds.map((id) => db.collection("users").doc(id).get())
        );
        const userDetails = Object.fromEntries(
            userDocs.map((doc) => [doc.id, doc.exists ? doc.data() : null])
        );

        const targetCollection = getTargetCollection(level);
        let targetDetails = {};
        if (targetCollection && targetIds.length) {
            const targetDocs = await Promise.all(
                targetIds.map((id) => db.collection(targetCollection).doc(id).get())
            );
            targetDetails = Object.fromEntries(
                targetDocs.map((doc) => [doc.id, doc.exists ? doc.data() : null])
            );
        }

        const fileThumbnails = await Promise.all(
            fileIds.map((id) => getFileThumbnail(id))
        );
        const fileUrls = await Promise.all(
            fileIds.map((id) => getFileUrl(id))
        );

        const fileDetails = Object.fromEntries(
            fileIds.map((id, index) => [
                id,
                { thumbnailUrl: fileThumbnails[index], fileUrl: fileUrls[index] },
            ])
        );

        const enrichedAnnouncements = announcements.map((a) => ({
            ...a,
            postedByInfo: userDetails[a.postedBy] || null,
            targetInfo: targetDetails[a.targetId] || a.targetId,
            thumbnailUrl: a.fileId ? fileDetails[a.fileId]?.thumbnailUrl : null,
            fileUrl: a.fileId ? fileDetails[a.fileId]?.fileUrl : null,
        }));

        res.status(200).send(enrichedAnnouncements);
    } catch (error) {
        console.error("Error fetching announcements by level:", error);
        res.status(500).send({ message: "Error fetching announcements", error });
    }
});

// Get all announcements
router.get("/all", async(req, res) => {
    try {
        const snapshot = await db.collection("announcements").get();
        if (snapshot.empty) return res.status(200).send([]);

        const announcements = snapshot.docs.map((doc) => doc.data());
        const userIds = [...new Set(announcements.map((a) => a.postedBy))];
        const targetIdsByLevel = announcements.reduce((acc, a) => {
            if (a.targetId) {
                const collection = getTargetCollection(a.level);
                if (collection)
                    acc[collection] = (acc[collection] || new Set()).add(a.targetId);
            }
            return acc;
        }, {});

        const userDocs = await Promise.all(
            userIds.map((id) => db.collection("users").doc(id).get())
        );
        const userDetails = Object.fromEntries(
            userDocs.map((doc) => [doc.id, doc.exists ? doc.data() : null])
        );

        const targetDetails = {};
        for (const [collection, ids] of Object.entries(targetIdsByLevel)) {
            const docs = await Promise.all(
                [...ids].map((id) => db.collection(collection).doc(id).get())
            );
            docs.forEach(
                (doc) => (targetDetails[doc.id] = doc.exists ? doc.data() : null)
            );
        }

        const enrichedAnnouncements = announcements.map((a) => ({
            ...a,
            postedByInfo: userDetails[a.postedBy] || null,
            targetInfo: targetDetails[a.targetId] || a.targetId,
        }));

        res.status(200).send(enrichedAnnouncements);
    } catch (error) {
        console.error("Error fetching all announcements:", error);
        res.status(500).send({ message: "Error fetching announcements", error });
    }
});

// Get announcements posted by a user
router.get("/postedby/:userId", async(req, res) => {
    const { userId } = req.params;

    try {
        const snapshot = await db
            .collection("announcements")
            .where("postedBy", "==", userId)
            .get();
        if (snapshot.empty) return res.status(200).send([]);

        const announcements = snapshot.docs.map((doc) => doc.data());
        const userIds = [...new Set(announcements.map((a) => a.postedBy))];
        const targetIds = [
            ...new Set(announcements.map((a) => a.targetId).filter(Boolean)),
        ];

        const userDocs = await Promise.all(
            userIds.map((id) => db.collection("users").doc(id).get())
        );
        const userDetails = Object.fromEntries(
            userDocs.map((doc) => [doc.id, doc.exists ? doc.data() : null])
        );

        const targetCollectionByLevel = announcements.reduce((acc, a) => {
            if (a.targetId) {
                const collection = getTargetCollection(a.level);
                if (collection)
                    acc[collection] = (acc[collection] || new Set()).add(a.targetId);
            }
            return acc;
        }, {});

        const targetDetails = {};
        for (const [collection, ids] of Object.entries(targetCollectionByLevel)) {
            const docs = await Promise.all(
                [...ids].map((id) => db.collection(collection).doc(id).get())
            );
            docs.forEach(
                (doc) => (targetDetails[doc.id] = doc.exists ? doc.data() : null)
            );
        }

        const enrichedAnnouncements = announcements.map((a) => ({
            ...a,
            postedByInfo: userDetails[a.postedBy] || null,
            targetInfo: targetDetails[a.targetId] || a.targetId,
        }));

        res.status(200).send(enrichedAnnouncements);
    } catch (error) {
        console.error("Error fetching announcements posted by user:", error);
        res.status(500).send({ message: "Error fetching announcements", error });
    }
});

module.exports = router;