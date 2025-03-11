# VPP Connect Application – Database Schema

## 1. Overview

The VPP Connect Application is designed to integrate features from real-time communication tools and classroom management systems. This schema leverages Firestore to provide a scalable, secure, and role-based data structure. The key principles include:
- **Super Admin Control:** Full oversight across all collections.
- **Department Association:** Every user is tied to a department.
- **Class Membership:** Students are assigned to a class.
- **Multi-level Announcements:** Ability to post at college, department, committee, or classroom levels.
- **Group Creation Workflow:** New classes or committees are created only after a super_admin approval.

---

## 2. Collections and Schemas

### 2.1 Users (`users`) ✅
**Purpose:** Stores profiles for all users including students, faculty, admins, and super_admins.

| Field         | Type      | Description |
|---------------|-----------|-------------|
| `userId`      | String    | Unique identifier (matches Firebase Auth UID) |
| `name`        | String    | Full name of the user |
| `email`       | String    | Email address |
| `role`        | String    | One of: `student`, `faculty`, `admin`, `super_admin` |
| `departmentId`| String    | Department the user belongs to |
| `classId`     | String    | (Optional) For students, the class identifier |
| `profilePic`  | String    | URL for the profile picture |
| `createdAt`   | Timestamp | Account creation time |


### 2.2 Departments (`departments`) ✅
**Purpose:** Contains metadata for each academic department.

| Field          | Type      | Description |
|----------------|-----------|-------------|
| `departmentId` | String    | Unique department identifier |
| `name`         | String    | Department name (e.g., "Computer Science") |
| `description`  | String    | Brief description of the department |
| `adminIds`     | Array     | List of department admin user IDs |
| `facultyIds`   | Array     | List of faculty associated with the department |
| `createdAt`    | Timestamp | Timestamp when the department was created |


### 2.3 Classes (`classes`) ✅
**Purpose:** Represents classrooms. Each student is enrolled in one class.

| Field         | Type      | Description |
|---------------|-----------|-------------|
| `classId`     | String    | Unique class identifier |
| `name`        | String    | Class name (e.g., "B.Tech CS - 2025") |
| `divisionName`| String    | Division (A, B, C, etc.) |
| `semester`    | Numeric   | Semester (e.g., 4, 5, 6, 7, 8) |
| `departmentId`| String    | Department this class belongs to |
| `facultyIds`  | Array     | List of faculty teaching this class |
| `studentIds`  | Array     | List of student user IDs enrolled in the class |
| `createdAt`   | Timestamp | Class creation time |


### 2.4 Committees / Communities (`groups`) ✅
**Purpose:** Stores committees or other community groups (e.g., clubs) created within the college.

| Field         | Type      | Description |
|---------------|-----------|-------------|
| `groupId`     | String    | Unique group identifier |
| `name`        | String    | Name of the group |
| `type`        | String    | Group type (e.g., `committee`, `community`) |
| `createdBy`   | String    | `userId` of the super_admin who created the group |
| `adminIds`    | Array     | List of user IDs with admin rights for the group |
| `memberIds`   | Array     | List of user IDs who are members |
| `createdAt`   | Timestamp | Timestamp of group creation |


### 2.5 Group Memberships (`group_members`) ✅
**Purpose:** Manages membership details for groups that aren’t implicitly derived from the user document (primarily for committees/communities).

| Field      | Type   | Description |
|------------|--------|-------------|
| `groupId`  | String | The associated group identifier |
| `userId`   | String | The user identifier |
| `role`     | String | Role within the group (e.g., `member`, `admin`) |


### 2.6 Group Creation Requests (`group_requests`) ✅
**Purpose:** Handles requests for the creation of new classes, committees, or communities. Requests are submitted by users and must be approved by a super_admin.

| Field         | Type      | Description |
|---------------|-----------|-------------|
| `requestId`   | String    | Unique request identifier |
| `requestedBy` | String    | `userId` of the requester |
| `groupName`   | String    | Desired group name |
| `type`        | String    | Requested group type (`class`, `committee`, or `community`) |
| `reason`      | String    | Justification for the request |
| `status`      | String    | `pending`, `approved`, or `rejected` |
| `approvedBy`  | String    | (Optional) `userId` of the super_admin who approved the request |
| `createdAt`   | Timestamp | Request creation time |


### 2.7 Chatrooms (`chatrooms`) ✅
**Purpose:** Facilitates real-time communication for groups. Each group (class, committee, department, etc.) can have its dedicated chatroom.

| Field         | Type      | Description |
|---------------|-----------|-------------|
| `chatroomId`  | String    | Unique chatroom identifier |
| `groupId`     | String    | Associated group identifier |
| `createdAt`   | Timestamp | Chatroom creation time |

**Subcollection: `messages`**

| Field       | Type      | Description |
|-------------|-----------|-------------|
| `messageId` | String    | Unique message identifier |
| `senderId`  | String    | `userId` of the sender |
| `content`   | String    | Message text |
| `timestamp` | Timestamp | Time when the message was sent |


### 2.8 Announcements (`announcements`) ✅
**Purpose:** Enables posting announcements across different scopes—college, department, committee, or classroom.

| Field            | Type      | Description |
|------------------|-----------|-------------|
| `announcementId` | String    | Unique announcement identifier |
| `level`          | String    | Announcement scope: `college`, `department`, `committee`, or `classroom` |
| `targetId`       | String    | For college-level announcements: `null`; otherwise, the corresponding `departmentId`, `groupId`, or `classId` |
| `postedBy`       | String    | `userId` of the poster |
| `content`        | String    | Announcement text |
| `timestamp`      | Timestamp | Time of posting |


### 2.9 Tasks (`tasks`) ✅
**Purpose:** Manages assignments and tasks. Tasks are assigned to an entire group (e.g., a class) rather than individual students.

| Field         | Type      | Description |
|---------------|-----------|-------------|
| `taskId`      | String    | Unique task identifier |
| `groupId`     | String    | Identifier of the group (e.g., class) receiving the task |
| `assignedBy`  | String    | `userId` of the faculty/admin assigning the task |
| `title`       | String    | Task title |
| `description` | String    | Detailed description of the task |
| `deadline`    | Timestamp | Deadline for task submission |
| `status`      | String    | Overall status (e.g., `pending`, `completed`) |

**Subcollection: `task_submissions`**

| Field          | Type      | Description |
|----------------|-----------|-------------|
| `submissionId` | String    | Unique submission identifier |
| `userId`       | String    | `userId` of the student submitting the task |
| `fileUrl`      | String    | URL to the submitted file |
| `submittedAt`  | Timestamp | Submission timestamp |


### 2.10 Microblogs (`microblogs`) ✅
**Purpose:** Provides a social feed similar to Twitter for short posts and interactions among users.

| Field      | Type      | Description |
|------------|-----------|-------------|
| `postId`   | String    | Unique post identifier |
| `authorId` | String    | `userId` of the poster |
| `content`  | String    | Post content |
| `likes`    | Number    | Count of likes on the post |
| `timestamp`| Timestamp | Post creation time |

**Subcollection: `comments`**

| Field       | Type      | Description |
|-------------|-----------|-------------|
| `commentId` | String    | Unique comment identifier |
| `authorId`  | String    | `userId` of the commenter |
| `content`   | String    | Comment text |
| `timestamp` | Timestamp | Time when the comment was posted |


## 3. Access Control

**Super Admin:**
- Full rights across all collections.
- Can create or delete groups (classes, committees, etc.), manage user roles, and post college-wide announcements.

**Department Admin / Faculty:**
- Can manage classes and committees within their department.
- Authorized to post department or class-level announcements and assign tasks.

**Students:**
- Can view announcements, participate in chatrooms, and submit tasks for their class.
- Their department and class membership is enforced via the `departmentId` and `classId` fields in the `users` collection.

**Security Implementation:**
Firestore security rules must enforce that only users with the appropriate roles and memberships can read or write data in the respective collections.


## 4. Hierarchical Relationships and Workflow

- **User Enrollment:**  
  • Every user record includes a `departmentId` ensuring they receive relevant department-level information.  
  • Students also have a `classId`, linking them to their classroom environment.

- **Group Creation & Approval:**  
  • Any new request for a committee, class, or community is submitted to the `group_requests` collection.  
  • A super_admin reviews and, upon approval, creates the corresponding record in the `groups` collection and assigns the appropriate admin rights.

- **Announcements and Tasks:**  
  • Announcements are targeted based on a `level` and `targetId`. This ensures that college-wide, departmental, committee, or classroom announcements reach only the intended audience.  
  • Tasks are assigned to a group (e.g., a class), allowing all enrolled students to access the assignment without the need for individual assignment lists.

- **Communication:**  
  • Each group can have an associated chatroom (stored in `chatrooms` with a `messages` subcollection) for real-time discussions.


## 5. Conclusion

This schema offers a comprehensive and secure structure for the College Connect Application. It aligns with the following goals:
- **Full oversight and control** by super_admin.
- **Clear association** of users to departments and, for students, to classes.
- **Flexible yet controlled group creation** through an approval process.
- **Efficient and targeted communication** through hierarchical announcements and group-based tasks.
