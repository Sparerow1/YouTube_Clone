// 1. deal with all the google cloud storage interactions in a separate file called storage.ts
// 2. deal with the local storage interactions in this file as well

import { Storage } from '@google-cloud/storage'; // Import the Storage class from the '@google-cloud/storage' package
import fs from 'fs'; // Import the fs module to work with the file system
import ffmpeg from 'fluent-ffmpeg'; // Import the fluent-ffmpeg package to work with ffmpeg

const storage = new Storage(); // Create a new instance of the Google Cloud Storage class

const rawVideoBucketName = 'yc-raw-videos'; // Define the name of the bucket for raw videos. Has to be unique. This is where people will upload their videos
const processedVideoBucketName = 'yc-processed-videos'; // Define the name of the bucket for processed videos. Has to be unique. This is where the processed videos will be stored
const localRawVideoPath = './raw-videos/'; // Define the path for the local raw videos directory
const localProcessedVideoPath = './processed-videos/'; // Define the path for the local processed videos directory
const localScreenshotPath = './yc-thumbnails/'; // Define the path for the local thumbnails directory
const screenshotPath = 'yc-thumbnails'; // Define the path for the thumbnails directory
/**
 * create local directory for raw and processed videos
 * 
 */
export function setUpDirectories() {
    ensureDirectoryExists(localRawVideoPath); // Ensure that the local raw videos directory exists. If not create it
    ensureDirectoryExists(localProcessedVideoPath); // Ensure that the local processed videos directory exists. If not create it.
    ensureDirectoryExists(localScreenshotPath); // Ensure that the local thumbnails directory exists. If not create it.
}
/**
 @param rawVideoName - the name of the raw video file from {@link localRawVideoPath}
 @param processedVideoName - the name of the processed video file and be found in {@link localProcessedVideoPath}
 @returns a promise that resolves with the path to the raw video file
*/
export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {  // Create a new Promise that resolves with the path to the raw video file
    // Create the ffmpeg command
  ffmpeg(`${localRawVideoPath}/${rawVideoName}`) // Specify the input file path. The raw video file is located in the localRawVideoPath directory
  .outputOptions('-vf', 'scale=-1:360') // Resize the video to 360p
  .on('end', function() { // listen for the 'end' event and send a success response
      console.log('Processing finished successfully');
      resolve(); // Resolve the promise with the path to the raw video file
  })
  .on('error', function(err: any) { // listen for the 'error' event and send an error response
      console.log('An error occurred: ' + err.message);
      reject(err); // Reject the promise with an error message
  })
  .save(`${localProcessedVideoPath}/${processedVideoName}`); // Save the processed video to the output file path. The processed video file is saved in the localProcessedVideoPath directory
  });
}

/**
 * @param fileName - the name of the file to be downloaded from the
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} directory
 * @returns a promise that resolves when the file has been downloaded
 */
export async function downloadRawVideo(fileName: string) { // Define a function to download a video file from the raw video bucket
    await storage.bucket(rawVideoBucketName) // Specify the raw video bucket
    // since the .download() method is asynchornous returns a promise, we can use the await keyword to wait for the download to complete
        .file(fileName) // Specify the file to be downloaded from the raw video bucket
        .download({ destination: `${localRawVideoPath}/${fileName}` }) // Download the file to the localRawVideoPath directory
    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.` // Log a success message
    )
};

/**
 * @param fileName - the name of the file to be uploaded from the
 * {@link localProcessedVideoPath} directory to the {@link processedVideoBucketName} bucket
 * @returns a promise that resolves when the file has been uploaded
 */
export async function uploadVideo(fileName: string) { // Define a function to upload a video file to the processed video bucket
    const bucket = storage.bucket(processedVideoBucketName); // Specify the processed video bucket 

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, // Upload the file from the localProcessedVideoPath directory to the processed video bucket
    {
        destination: fileName // Specify the destination file name in the processed video bucket
    }); // Upload the file from the localProcessedVideoPath directory to the processed video bucket
    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.` // Log a success message
    );
    await bucket.file(fileName).makePublic(); // Make the uploaded file public because by default the files are not public
};


/**
 * @param fileName - the name of the file to be deleted from the
 * {@link localProcessedVideoPath} folder
 * @returns a promise that resolves when the file has been deleted
 *
 */

export async function deleteProcessedVideo(fileName: string) { // Define a function to delete a processed video file
    return deleteFile(`${localProcessedVideoPath}/${fileName}`); // Delete the file from the localProcessedVideoPath directory and return the result
};


/**
 * @param fileName - the name of the file to be deleted from the
 * {@link localRawVideoPath} folder
 * @returns a promise that resolves when the file has been deleted
 */

export async function deleteRawVideo(fileName: string) { // Define a function to delete a raw video file
    return deleteFile(`${localRawVideoPath}/${fileName}`); // Delete the file from the localRawVideoPath directory and return the result
};


/**
 * @param filePath - the path of the file to be deleted
 * @returns a promise that resolves when the file has been deleted
 */
function deleteFile(filePath: string): Promise <void> { // Define a function to delete a file
    return new Promise((resolve, reject) => { // Create a new Promise that resolves when the file has been deleted
        if (fs.existsSync(filePath)) { // Check if the file exists
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Cannot delete file at ${filePath}`, err); // Log an error message that we cannot delete the file. Also log the error message
                    reject(err); // Reject the promise with an error message
                } else {
                    console.log(`File deleted at ${filePath}`); // Log a success message that the file has been deleted
                    resolve(); // Resolve the promise
                }
            }); // Delete the file
        } else {
            console.log(`File not found at ${filePath}, skip the delete`); // Log a message if the file is not found in the specified path
            reject(`File not found at ${filePath}`); // Reject the promise with an error message if the file is not found
        }
    })
};

/**
 * Ensures that a directory exists. If the directory does not exist, it will be created if necessary.
 * @param {string} dirPath - The path of the directory to be checked
 */
function ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) { // Check if the directory does not exist
        fs.mkdirSync(dirPath, { recursive: true }); // Create the directory recursively
        // recursive: true enables creating nested directories
        console.log(`Directory created at ${dirPath}`); // Log a message that the directory has been created
    }
}


/**
 * get a snapshot of the processed videos and save it as a thumbnail
 * @param {string} fileName - the name of the video file
 */
export async function generateThumbnail(fileName: string) {
    return new Promise<void>((resolve, reject) => { // Create a new Promise that resolves when the thumbnail has been generated
        ffmpeg(`${localProcessedVideoPath}/${fileName}`) // Specify the input file path. The processed video file is located in the localProcessedVideoPath directory
        .screenshots({ // Generate a screenshot of the video
            count: 1, // Specify the number of screenshots to generate
            folder: localScreenshotPath, // Specify the folder to save the screenshot
            filename: `${fileName}.png` // Specify the filename of the screenshot
        })
        .on('end', function() { // listen for the 'end' event and send a success response
            console.log('Thumbnail generated successfully');
            resolve(); // Resolve the promise
        })
        .on('error', function(err: any) { // listen for the 'error' event and send an error response
            console.log('An error occurred when generating thumbnail: ' + err.message);
            reject(err); // Reject the promise with an error message
        })
    });
}


/**
 * upload the thumbnail to the cloud storage
 * @param {string} fileName - the name of the thumbnail file
 */
export async function uploadThumbnail(fileName: string) {
    const bucket = storage.bucket(screenshotPath); // Specify the processed thumbnails bucket
    const thumbnailName = `${fileName}.png`; // Define the name of the thumbnail file

    await bucket.upload(`${localScreenshotPath}/${thumbnailName}`, // Upload the thumbnail from the localProcessedVideoPath directory to the thumbnail bucket
    {
        destination: thumbnailName // specify the destination file name in the thumbnail bucket
    }); // Upload the thumbnail from the localScreenshotPath directory to the processed video bucket
    console.log(
        `${localScreenshotPath}/${thumbnailName} uploaded to gs://${screenshotPath}/${thumbnailName}.` // Log a success message
    );
    await bucket.file(thumbnailName).makePublic(); // Make the uploaded thumbnail public
}

//delete the local thumbnail
export async function deleteThumbnail(fileName: string) {
    return deleteFile(`${localScreenshotPath}/${fileName}.png`); // Delete the thumbnail from the localScreenshotPath directory
}