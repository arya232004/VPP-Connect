const express = require('express');
const router = express.Router();
const {
    db,
    admin
} = require('../../firebase/config');

const {
    createRoomInFirebase,
    deleteRoomInFirebase
} = require('../../chat/socket/config');


function generateuniqueId(departmentName) {
    return departmentName.split(' ').join('') + Math.random().toString(36).substr(2, 16);
}

router.post('/create', async(req, res) => {
    const {
        departmentName,
        departmentDescription
    } = req.body;
    if (!departmentName || !departmentDescription) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }
    try {
        const deptid = generateuniqueId(departmentName);
        const departmentRef = db.collection('departments').doc(deptid);
        const departmentDoc = await departmentRef.get();
        const roomData = await createRoomInFirebase(departmentName);

        if (departmentDoc.exists) {
            return res.status(200).json({
                message: 'Department already exists',
                department: departmentDoc.data()
            });
        } else {
            await departmentRef.set({
                departmentName,
                departmentDescription,
                departmentId: deptid,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                facultyIds: [],
                adminIds: [],
                deptRoomId: roomData.roomId
            }, {
                merge: true
            });
            return res.status(201).json({
                message: 'Department created successfully',
                department: {
                    departmentName,
                    departmentDescription,
                    departmentId: deptid,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    facultyIds: [],
                    adminIds: [],
                    deptRoomId: roomData.roomId
                }
            });
        }
    } catch (error) {
        console.error("Error creating department:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.get('/get/:departmentId', async(req, res) => {
    const {
        departmentId
    } = req.params;
    if (!departmentId) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }
    try {
        const departmentRef = db.collection('departments').doc(departmentId);
        const departmentDoc = await departmentRef.get();
        if (!departmentDoc.exists) {
            return res.status(404).json({
                error: 'Department not found'
            });
        }
        return res.status(200).json({
            department: departmentDoc.data()
        });
    } catch (error) {
        console.error("Error fetching department:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.get('/all', async(req, res) => {
    try {
        const departmentsRef = db.collection('departments');
        const snapshot = await departmentsRef.get();
        const departments = [];
        snapshot.forEach((doc) => {
            departments.push(doc.data());
        });
        return res.status(200).json({
            departments
        });
    } catch (error) {
        console.error("Error fetching departments:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Update department details
router.put('/update/:departmentId', async(req, res) => {
    const {
        departmentId
    } = req.params;
    const updates = req.body;
    try {
        const departmentRef = db.collection('departments').doc(departmentId);
        await departmentRef.update(updates);
        return res.status(200).json({
            message: 'Department updated successfully'
        });
    } catch (error) {
        console.error("Error updating department:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.post('/createclass', async(req, res) => {
    const {
        departmentId,
        className,
        numOfDivisions,
        divNames,
        semester,
        facultyIds,
        studentIds
    } = req.body;

    // Validate required fields
    if (!departmentId || !className || !numOfDivisions || !divNames || !semester) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }

    // Ensure divisionName is an array
    if (!Array.isArray(divNames)) {
        return res.status(400).json({
            error: 'Division names must be an array'
        });
    }

    try {

        const roomforDepartment = await createRoomInFirebase(className);

        const divisionsPromises = divNames.map(async(divName) => {
            const divisionId = generateuniqueId(className + ' ' + divName);
            const divisionRef = db.collection('classes').doc(divisionId);
            const roomData = await createRoomInFirebase(className + ' ' + divName);
            await divisionRef.set({
                classId: divisionId,
                divisionName: divName,
                semester: semester,
                departmentId: departmentId,
                facultyIds: facultyIds ? facultyIds : [],
                studentIds: studentIds ? studentIds : [],
                name: className,
                roomData: roomData.roomId,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            return divisionRef.id;
        });

        // Wait for all division documents to be created
        const divisionIds = await Promise.all(divisionsPromises);

        // Store all IDs in department document under classes
        const departmentRef = db.collection('departments').doc(departmentId);
        await departmentRef.update({
            classes: admin.firestore.FieldValue.arrayUnion(...divisionIds)
        });

        return res.status(201).json({
            message: 'Class and divisions created successfully'
        });
    } catch (error) {
        console.error("Error creating class and divisions:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.get('/classes/:departmentId', async(req, res) => {
    const {
        departmentId
    } = req.params;
    if (!departmentId) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }

    try {
        const classesRef = db.collection('departments')
            .doc(departmentId);

        const snapshot = await classesRef.get();
        const classes = snapshot.data().classes;
        return res.status(200).json({
            classes
        });
    } catch (error) {
        console.error("Error fetching classes:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// get all classes
router.get('/allclasses', async(req, res) => {
    try {
        const classesRef = db.collection('classes');
        const snapshot = await classesRef.get();
        const classes = [];
        snapshot.forEach((doc) => {
            classes.push(doc.data());
        });
        return res.status(200).json({
            classes
        });
    } catch (error) {
        console.error("Error fetching classes:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.get('/class/:classId', async(req, res) => {
    const {
        classId
    } = req.params;
    if (!classId) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }

    try {
        const classRef = db.collection('classes').doc(classId);
        const classDoc = await classRef.get();
        if (!classDoc.exists) {
            return res.status(404).json({
                error: 'Class not found'
            });
        }
        return res.status(200).json({
            class: classDoc.data()
        });
    } catch (error) {
        console.error("Error fetching class:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

router.put('/class/update/:classId', async(req, res) => {
    const {
        classId
    } = req.params;
    const updates = req.body;

    try {
        const classRef = db.collection('classes').doc(classId);
        await classRef.update(updates);
        return res.status(200).json({
            message: 'Class updated successfully'
        });
    } catch (error) {
        console.error("Error updating class:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// delete class
router.delete('/class/delete/:classId', async(req, res) => {
    const {
        classId
    } = req.params;

    try {
        const classRef = db.collection('classes').doc(classId);
        const classDoc = await classRef.get();

        if (!classDoc.exists) {
            return res.status(404).json({
                error: 'Class not found'
            });
        }

        const roomId = classDoc.data().roomData;

        // Delete the chatroom for the class
        await deleteRoomInFirebase(roomId);

        await classRef.delete();
        return res.status(200).json({
            message: 'Class and associated chatroom deleted successfully'
        });
    } catch (error) {
        console.error("Error deleting class:", error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

module.exports = router;