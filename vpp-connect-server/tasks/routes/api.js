const express = require('express');
const router = express.Router();
const { db, admin } = require('../../firebase/config');
const multer = require('multer');
const { uploadFile, getFileThumbnail, getFileUrl } = require('../../drive/controllers/apicontroller.js');
const { sendemail } = require('../../notification/controllers/apicontroller.js');

// Function to generate a unique ID for the task
function generateUniqueID() {
    return Math.random().toString(36).substr(2, 16);
}

// function to fetch student's name and profilePic based on studentId
async function getStudentDetails(studentId) {
    try {
        const studentDoc = await db.collection('users').doc(studentId).get();
        if (studentDoc.exists) {
            const studentData = studentDoc.data();
            return {
                studentName: studentData.fullname,
                studentProfilePic: studentData.profilePic,
                studentEmail: studentData.email
            };
        } else {
            throw new Error('Student not found');
        }
    } catch (error) {
        console.error('Error fetching student:', error);
        throw new Error('Internal server error');
    }
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new task
router.post('/create', upload.single('file'), async(req, res) => {
    const { classId, assignedBy, title, description, type, deadline, status, subject, priority, total } = req.body;
    const file = req.file;
    const taskId = generateUniqueID();

    try {
        let fileid = null;
        if (file) {
            fileid = await uploadFile('tasks', file.originalname, file.buffer);
        }

        // Create the task document in the 'tasks' collection
        await db.collection('tasks').doc(taskId).set({
            taskId,
            assignedBy,
            title,
            classId,
            description,
            type,
            postedat: admin.firestore.Timestamp.now(),
            fileid,
            deadline: admin.firestore.Timestamp.fromDate(new Date(deadline)),
            status,
            subject,
            priority,
            total
        });

        // Update the class document in the 'classes' collection by adding the task ID
        await db.collection('classes').doc(classId).update({
            tasks: admin.firestore.FieldValue.arrayUnion(taskId)
        });

        // Initialize the submissions subcollection with a pending entry for each student
        const classDoc = await db.collection('classes').doc(classId).get();
        if (classDoc.exists) {
            const studentIds = classDoc.data().studentIds || [];
            for (const studentId of studentIds) {
                await db.collection('tasks').doc(taskId)
                    .collection('submissions').doc(studentId)
                    .set({
                        studentId,
                        date: null,
                        type: null,
                        submissionfileurl: null, // No submission yet
                        status: 'pending',
                        marks: null
                    });
            }
        }

        res.status(201).send({ message: 'Task created successfully', taskId });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error creating task', error });
    }
});

// Get tasks assigned to a specific student along with submission details
router.get('/student/:studentId', async(req, res) => {
    const { studentId } = req.params;
    try {
        // Retrieve all submissions in the collection group
        const submissionsSnapshot = await db.collectionGroup('submissions').get();

        // Filter to only include documents where the document ID equals the studentId
        const filteredSubmissions = submissionsSnapshot.docs.filter(doc => doc.id === studentId);

        if (filteredSubmissions.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this student.' });
        }

        // For each matching submission, retrieve its parent task document
        const tasksPromises = filteredSubmissions.map(async(submissionDoc) => {
            // Get the parent task document reference (path: tasks/{taskId})
            const taskDocRef = submissionDoc.ref.parent.parent;
            if (taskDocRef) {
                const taskDoc = await taskDocRef.get();
                if (taskDoc.exists) {
                    // Fetch the file information if fileId is not null
                    const taskData = taskDoc.data();
                    if (taskData.fileid) {
                        taskData.thumbnailUrl = await getFileThumbnail(taskData.fileid);
                        taskData.fileUrl = await getFileUrl(taskData.fileid);
                    }

                    // fetch faculty profilePic and name based on assignedBy
                    const facultyDoc = await db.collection('users').doc(taskData.assignedBy).get();
                    if (facultyDoc.exists) {
                        const facultyData = facultyDoc.data();
                        taskData.facultyName = facultyData.fullname;
                        taskData.facultyProfilePic = facultyData.profilePic;
                    }

                    // Combine task data with submission details
                    return {
                        ...taskData,
                        submission: submissionDoc.data()
                    };
                }
            }
            return null;
        });

        const tasksResults = await Promise.all(tasksPromises);
        const tasks = tasksResults.filter(task => task !== null);

        res.status(200).json({ tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
});


// Get all submissions for a given task (assignment)
// Get all tasks (assignments) along with their submissions for a given faculty
router.get('/faculty/:facultyId', async(req, res) => {
    const { facultyId } = req.params;
    try {
        // Query tasks where the assignment was posted by the given faculty
        const tasksSnapshot = await db.collection('tasks')
            .where('assignedBy', '==', facultyId)
            .get();

        if (tasksSnapshot.empty) {
            return res.status(404).json({ message: 'No tasks found for this faculty.' });
        }

        // For each task, retrieve its submissions subcollection
        const tasksWithSubmissions = await Promise.all(tasksSnapshot.docs.map(async(taskDoc) => {
            const taskData = taskDoc.data();

            // Fetch the file information if fileId is not null
            if (taskData.fileid) {
                taskData.thumbnailUrl = await getFileThumbnail(taskData.fileid);
                taskData.fileUrl = getFileUrl(taskData.fileid);
            }

            // fetch faculty profilePic and name based on assignedBy
            const facultyDoc = await db.collection('users').doc(taskData.assignedBy).get();
            if (facultyDoc.exists) {
                const facultyData = facultyDoc.data();
                taskData.facultyName = facultyData.fullname;
                taskData.facultyProfilePic = facultyData.profilePic;
            }

            // Get submissions for the current task
            const submissionsSnapshot = await db.collection('tasks').doc(taskData.taskId)
                .collection('submissions').get();

            // Map the submissions into an array
            const submissions = submissionsSnapshot.docs.map(subDoc => ({
                id: subDoc.id,
                ...subDoc.data()
            }));

            return {
                ...taskData,
                submissions
            };
        }));

        res.status(200).json({ tasks: tasksWithSubmissions });
    } catch (error) {
        console.error('Error fetching faculty submissions:', error);
        res.status(500).json({ message: 'Error fetching submissions', error });
    }
});

// Upload assignment submission
// Upload assignment submission
router.post('/:taskId/submissions/upload', upload.single('file'), async(req, res) => {
    const { taskId } = req.params;
    const { studentId, submissionType } = req.body;
    const file = req.file;

    try {
        let submissionFileUrl = null;
        if (file) {
            // Upload the submission file to your storage
            submissionFileUrl = await uploadFile('tasks', file.originalname, file.buffer);
        }

        // Prepare the update data for the submission document
        const updateData = {
            submissionfileurl: submissionFileUrl,
            date: admin.firestore.Timestamp.now(),
            type: submissionType || null,
            status: 'submitted',
            marks: null
        };

        // Create or update the submission document for the student under the specified task
        await db.collection('tasks').doc(taskId)
            .collection('submissions').doc(studentId)
            .update(updateData, { merge: true });

        res.status(200).json({ message: 'Assignment submitted successfully', submission: updateData });
    } catch (error) {
        console.error("Error uploading submission:", error);
        res.status(500).json({ message: 'Error uploading submission', error });
    }
});


// Get details of a task by taskId
router.get('/:taskId', async(req, res) => {
    const { taskId } = req.params;

    try {
        const taskDoc = await db.collection('tasks').doc(taskId).get();
        if (taskDoc.exists) {
            const taskData = taskDoc.data();
            if (taskData.fileid) {
                taskData.thumbnailUrl = await getFileThumbnail(taskData.fileid);
                taskData.fileUrl = await getFileUrl(taskData.fileid);
            }

            // fetch faculty profilePic and name based on assignedBy
            const facultyDoc = await db.collection('users').doc(taskData.assignedBy).get();
            if (facultyDoc.exists) {
                const facultyData = facultyDoc.data();
                taskData.facultyName = facultyData.fullname;
                taskData.facultyProfilePic = facultyData.profilePic;
            }

            // Get submissions for the current task
            const submissionsSnapshot = await db.collection('tasks').doc(taskData.taskId)
                .collection('submissions').get();

            // Map the submissions into an array
            const submissions = await Promise.all(submissionsSnapshot.docs.map(async(subDoc) => {
                const submissionData = subDoc.data();
                const studentDetails = await getStudentDetails(submissionData.studentId);
                const submissionFileId = submissionData.submissionfileurl;
                if (submissionFileId) {
                    submissionData.submissionThumbnailUrl = await getFileThumbnail(submissionFileId);
                    submissionData.submissionFileUrl = getFileUrl(submissionFileId);
                }

                return {
                    ...submissionData,
                    ...studentDetails
                };
            }));

            res.status(200).send({
                ...taskData,
                submissions
            });
        } else {
            res.status(404).send({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Error fetching task', error });
    }
});

// Update a task's details
router.put('/:taskId', async(req, res) => {
    const { taskId } = req.params;
    const updates = req.body;

    try {
        if (updates.deadline) {
            updates.deadline = admin.firestore.Timestamp.fromDate(new Date(updates.deadline));
        }
        await db.collection('tasks').doc(taskId).update(updates);
        res.status(200).send({ message: 'Task updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating task', error });
    }
});

// Delete a task
router.delete('/:taskId', async(req, res) => {
    const { taskId } = req.params;

    try {
        await db.collection('tasks').doc(taskId).delete();
        res.status(200).send({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting task', error });
    }
});

// Grade a submission
router.put('/:taskId/submissions/:studentId', async(req, res) => {
    const { taskId, studentId } = req.params;
    const { marks } = req.body;

    try {
        await db.collection('tasks').doc(taskId)
            .collection('submissions').doc(studentId)
            .update({ marks, status: 'graded' });
        const studentDetails = await getStudentDetails(studentId);
        sendemail(
            studentDetails.studentEmail,
            'Assignment Marks Updated',
            `Your assignment marks for task: <code> ${taskId} </code> have been updated to ${marks}`
        )
        res.status(200).send({ message: 'Marks updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating marks', error });
    }
});

// Reject a submission


router.get('/class/:classId', async(req, res) => {
    const { classId } = req.params;

    try {
        const tasks = [];
        const snapshot = await db.collection('tasks').where('classId', '==', classId).get();
        snapshot.forEach(doc => {
            let task = doc.data();
            if (task.fileid) {
                task.thumbnailUrl = getFileThumbnail(task.fileid);
                task.fileUrl = getFileUrl(task.fileid);
            }
            tasks.push(task);
        });
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching tasks', error });
    }
});

// get tasks posted by a faculty
router.get('/faculty/:facultyId', async(req, res) => {
    const { facultyId } = req.params;

    try {
        const tasks = [];
        const snapshot = await db.collection('tasks').where('assignedBy', '==', facultyId).get();
        snapshot.forEach(doc => {
            let task = doc.data();
            if (task.fileid) {
                task.thumbnailUrl = getFileThumbnail(task.fileid);
                task.fileUrl = getFileUrl(task.fileid);
            }
            tasks.push(task);
        });
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching tasks', error });
    }
});

router.post('/reject/:taskId/submissions/:studentId', async(req, res) => {
    const { taskId, studentId } = req.params;

    try {
        await db.collection('tasks').doc(taskId)
            .collection('submissions').doc(studentId)
            .update({ status: 'rejected', submissionfileurl: null });
        const studentDetails = await getStudentDetails(studentId);
        sendemail(
            studentDetails.studentEmail,
            'Assignment Rejected',
            `Your assignment marks for task: <code> ${taskId} </code> have been rejected`
        )
        res.status(200).send({ message: 'Submission rejected successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error rejecting submission', error });
    }
});

module.exports = router;