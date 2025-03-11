const { google } = require('googleapis');
const { Readable } = require('stream');
const path = require('path');
const { format } = require('date-fns');
const dotenv = require('dotenv');
dotenv.config();


const keyFilePayh = path.join(__dirname, '../vppconnect-multimedia-0bb06c37eefd.json');
// Load the service account credentials from the serviceAccountKey.json file
const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePayh, // Use your actual path
    scopes: ['https://www.googleapis.com/auth/drive']
});

// Create a Drive client
const drive = google.drive({ version: 'v3', auth });

// Helper function to convert a Buffer into a Readable stream
function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

// Helper function to check if a folder exists inside a parent folder and get its ID
async function getSubfolderId(folderName, parentFolderId) {
    const response = await drive.files.list({
        q: `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });
    const folder = response.data.files.find(file => file.name === folderName);
    return folder ? folder.id : null;
}

// Function to upload a file to Google Drive
// Now the mainFolder (e.g., "chat") is used directly to get the folder ID
// and, if applicable, a date folder will be created inside it.
async function uploadFile(mainFolder, fileName, fileBuffer) {
    try {
        // Retrieve the main folder ID from .env using the main folder name
        const folderId = process.env[mainFolder.toLowerCase()];
        if (!folderId) {
            throw new Error(`Main folder '${mainFolder}' not found in .env`);
        }

        // Set destination folder to main folder by default
        let destinationFolderId = folderId;

        // For main folder types that require a date folder, create/find one
        if (['chat', 'announcements', 'microblogging', 'tasks'].includes(mainFolder.toLowerCase())) {
            // Create the date folder name using the current date in 'yyyy-MM-dd' format
            const dateFolderName = format(new Date(), 'yyyy-MM-dd');

            // Check if the date folder exists inside the main folder
            let dateFolderId = await getSubfolderId(dateFolderName, folderId);

            // If the date-named folder doesn't exist, create it
            if (!dateFolderId) {
                const newDateFolder = await drive.files.create({
                    resource: {
                        name: dateFolderName,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [folderId],
                    },
                    fields: 'id',
                });
                dateFolderId = newDateFolder.data.id;
                console.log(`Created new date folder: ${dateFolderName}, ID: ${dateFolderId}`);
            }
            destinationFolderId = dateFolderId;
        }

        // Convert the file buffer to a Readable stream
        const fileStream = bufferToStream(fileBuffer);

        // Upload the file to the destination folder
        const media = {
            mimeType: 'application/octet-stream', // or the actual MIME type
            body: fileStream,
        };

        const fileMetadata = {
            name: fileName,
            parents: [destinationFolderId],
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        console.log('File uploaded successfully, File ID: ', response.data.id);
        return response.data.id;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

async function getFileThumbnail(fileId) {
    try {
        const response = await drive.files.get({
            fileId: fileId,
            fields: 'thumbnailLink', // Request only the thumbnailLink field
        });

        const thumbnailLink = response.data.thumbnailLink;
        if (thumbnailLink) {
            console.log('Thumbnail URL:', thumbnailLink);
            return thumbnailLink;
        } else {
            console.log('Thumbnail not available for this file.');
        }
    } catch (error) {
        console.error('Error fetching file metadata:', error);
    }
}

// getFileThumbnail('1RoxNVJQOlDVV6He0bOq_2VYpe0N2A84p')


function getFileUrl(fileId) {
    if (!fileId) {
        return "";
    }

    // For images and generic files, we use export=view for in-browser preview.
    // For videos, you might want export=download to ensure proper playback.
    // if (fileType.toLowerCase() === "video") {
    //     return `https://drive.google.com/uc?export=download&id=${fileId}`;
    // }

    // Default to image/view URL
    return `https://drive.google.com/file/d/${fileId}/view`;
}



async function getFileMetadata(fileId) {
    try {
        const response = await drive.files.get({
            fileId: fileId,
            fields: 'thumbnailLink, webContentLink, webViewLink',
        });
        const { thumbnailLink, webContentLink, webViewLink } = response.data;

        return {
            thumbnailLink: thumbnailLink !== undefined ? thumbnailLink : null,
            webContentLink: webContentLink !== undefined ? webContentLink : null,
            webViewLink: webViewLink !== undefined ? webViewLink : null,
        };
    } catch (error) {
        console.error('Error fetching file metadata:', error);
        return null;
    }
}




// console.log(getFileUrl('16W9P9ePkl6BOkr9fJXBQ5eiNlkCh9X76'))



module.exports = { uploadFile, getFileUrl, getFileThumbnail, getFileMetadata };