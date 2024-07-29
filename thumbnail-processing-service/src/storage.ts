import { Storage } from "@google-cloud/storage";
import fs from "fs";
import jimp from "jimp";


const storage = new Storage(); // create a new storage instance
const rawThumbnailBucket = 'yc-thumbnails-raw'; // create a new bucket instance for raw thumbnails
const processedThumbnailBucket = 'yc-thumbnails'; // create a new bucket instance for processed thumbnails
const localThumbnailRawPath = './raw-thumbnails'; // create a new directory for local thumbnails
const localThumbnailProcessedPath = './processed-thumbnails'; // create a new directory for processed thumbnails

/**
 * @param dirPath the path of the directory to be created if not exists
 */
function ensureDirectoryExists(dirPath: string) { // function to ensure that a directory exists
  if (!fs.existsSync(dirPath)) { // if the directory does not exist
    fs.mkdirSync(dirPath, { recursive: true }); // create the directory
    console.log(`Directory created at ${dirPath}`); // Log a message that the directory has been created
    }
}

/**
 * @param filePath the path of the file to be deleted
 * @returns a promise that resolves when the file has been deleted
 */
function deleteFile(filePath: string): Promise<void> { // function to delete a file
    return new Promise<void>((resolve, reject) => {
        if (fs.existsSync(filePath)) { // if the file exists, then delete the file 
            fs.unlink(filePath, (err) => { 
                if (err) { // if there is an error
                   console.error(`Cannot delete file at ${filePath}`, err); // log the error to the console
                   reject(err); // reject the promise
                }
                else {
                    console.log(`File deleted at ${filePath}`); // log that the file has been deleted
                    resolve(); // resolve the promise
                }
        }); // delete the file
    }   else {
            console.log(`File does not exist at ${filePath}`); // log that the file does not exist
            reject(`File does not exist at ${filePath}`); // reject the promise
        }
    });
}

/**
 * create the directories locally if they do not exist
 */
export async function setUpDirectories() { // function to set up the directories
  ensureDirectoryExists(localThumbnailRawPath); // ensure that the raw thumbnail directory exists
  ensureDirectoryExists(localThumbnailProcessedPath); // ensure that the processed thumbnail directory exists
}

/**
 * 
 * @param fileName the name of the file to be downloaded
 * {@link rawThumbnailBucket} bucket and downloads the file to the {@link localThumbnailRawPath} directory
 * @returns a promise that resolves when the file has been downloaded
 */
export async function downloadRawThumbnail(fileName: string) {
    await storage.bucket(rawThumbnailBucket) // get the raw thumbnail bucket
        .file(fileName) // get the file with the specified name
        .download({destination: `${localThumbnailRawPath}/${fileName}`}); // download the raw thumbnail to the local directory
    console.log(`Raw thumbnail from gs://${rawThumbnailBucket}/${fileName} downloaded to ${localThumbnailRawPath}/${fileName}`); // log that the raw thumbnail has been downloaded
}

/**
 * @param fileName -the name of the file to be uploaded from the 
 * {@link localThumbnailProcessedPath} directory to the {@link processedThumbnailBucket} bucket
 * @returns a promise that resolves when the file has been uploaded
 */
export async function uploadProcessedThumbnail(fileName: string) {
    const bucket = storage.bucket(processedThumbnailBucket); // get the processed thumbnail bucket
    await bucket.upload(`${localThumbnailProcessedPath}/${fileName}`),  // upload the processed thumbnail to the bucket
    {
        destination: fileName // set the destination of the file
    };
    console.log(`Processed thumbnail uploaded to gs://${processedThumbnailBucket}/${fileName}`); // log that the processed thumbnail has been uploaded
    await bucket.file(fileName).makePublic(); // make the file public
}

/**
 * @param fileName the name of the file to be deleted from the {@link localThumbnailRawPath} directory
 */
export async function deleteRawThumbnail(fileName: string): Promise<void> {
    return deleteFile(`${localThumbnailRawPath}/${fileName}`); // delete the raw thumbnail file
}

/**
 * @param fileName the name of the file to be deleted from the {@link localThumbnailProcessedPath} directory
 */
export async function deleteProcessedThumbnail(fileName: string): Promise<void> {
    return deleteFile(`${localThumbnailProcessedPath}/${fileName}`); // delete the processed thumbnail file
}

/**
 * @param rawThumbnailName the name of the raw thumbnail file from {@link localThumbnailRawPath}
 * @param processedThumbnailName the name of the processed thumbnail file found in {@link localThumbnailProcessedPath}
 * @returns a promise that resolves when the thumbnail has been processed 
*/
export async function generateProcessedThumbnail(rawThumbnailName: string, processedThumbnailName: string) {
    return new Promise<void>((resolve, reject) => {
        // create new jimp image from the raw thumbnail to convert the image to png
        jimp.read(`${localThumbnailRawPath}/${rawThumbnailName}`, (err, image) => { // read the raw thumbnail
            if (err) { // if there is an error, log the error and reject the promise
                console.log(`Error reading image: ${err}`);
                reject(err);
            }
            // write the converted image to the processed thumbnail path
            image.write(`${localThumbnailProcessedPath}/${processedThumbnailName}`, (err) => {
                if (err) { // if there is an error, log the error and reject the promise
                    console.log(`Error writing image: ${err}`);
                    reject(err);
                }
                // log that the thumbnail has been processed and saved
                console.log(`Thumbnail processed and saved to ${localThumbnailProcessedPath}/${processedThumbnailName}`);
                resolve(); // resolve the promise
            }); // write the converted image to the processed thumbnail path
        });
    });
}