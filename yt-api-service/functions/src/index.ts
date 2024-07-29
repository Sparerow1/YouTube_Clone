import * as functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

initializeApp();// initialize the firebase app

const firestore = new Firestore(); // initialize the firestore object
const storage = new Storage(); // initialize the storage object

// define the name of the raw video bucket
const rawVideoBucketName = "yc-raw-videos";


const videoCollectionId = "videos"; // Define the collection ID

// Define the video interface
export interface Video {
// Define the Video interface with the following properties
    id?: string,
    uid?: string,
    filename?: string,
    status?: "processing" | "processed",
    title?: string,
    description?: string
    }

export const createUser = functions.auth.user().onCreate((user) => {
  const userInfo = {// get the user info from the user object
    uid: user.uid,
    email: user.email,
    photoURL: user.photoURL,
  };
  // add the user info to the users collection in the firestore database
  firestore.collection("users").doc(user.uid).set(userInfo);
  logger.info(`User Created: ${JSON.stringify(userInfo)}`);
  // log the user info that was created
  return;
});

export const generateUploadUrl = onCall({maxInstances: 1}, async (request) =>{
  // define the generateUploadUrl function
  // check if the user is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError(
      // throw an error if the user is not authenticated
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }
  const auth = request.auth; // get the user's authentication info
  const data = request.data; // get the data from the request
  const bucket = storage.bucket(rawVideoBucketName); // get the raw video bucket

  // generate a unique file name for the video
  const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
  // generate a unique file name for the video

  const [url] = await bucket.file(fileName).getSignedUrl({
    // get the signed url for the file
    version: "v4", // specify the version of the signed url
    action: "write", // specify the action for the signed url
    expires: Date.now() + 15 * 60 * 1000,
    // set the expiration time for the signed url to 15 minutes
  });

  return {url, fileName}; // return the signed url and the file name
});

export const getVideos = onCall({maxInstances: 1}, async () => {
  const snapshot =
    await firestore.collection(videoCollectionId).limit(10).get();
  return snapshot.docs.map((doc) => doc.data());
});

// Define the getVideosByUser function
export const getVideosByUser = onCall({maxInstances: 1}, async (request) => {
  const uid = request.auth?.uid; // get the user's uid
  if (!uid) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }
  const snapshot = await firestore
    .collection(videoCollectionId)
    .where("uid", "==", uid)
    .get();
  return snapshot.docs.map((doc) => doc.data());
});

export const editVideo = onCall({maxInstances: 1}, async (request) => {
  const uid = request.auth?.uid; // get the user's uid
  if (!uid) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }
  const data = request.data; // get the data from the request
  const videoId = data.id; // get the video id from the data
  // get the video reference
  const videoRef = firestore.collection(videoCollectionId).doc(videoId);
  const video = (await videoRef.get()).data() as Video; // get the video data
  if (video?.uid !== uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You do not have permission to edit this video."
    );
  }
  await videoRef.update(data); // update the video data
  return;
});

export const getVideoName = onCall({maxInstances: 1}, async (request) => {
  const data = request.data; // get the data from the request
  const videoId = data.id; // get the video id from the data
  // get the video reference
  const videoRef = firestore.collection(videoCollectionId).doc(videoId);
  const video = (await videoRef.get()).data() as Video; // get the video data
  return video.filename; // return the video filename
});

export const generateThumbnailUrl = onCall({maxInstances: 1},
  async (request) => {
    const data = request.data; // get the data from the request

    if (!request.auth) { // check if the user is authenticated
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }
    // check if the user has permission to generate a thumbnail for the video
    if (data.uid !== request.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to generate a thumbnail for this video."
      );
    }
    // get the thumbnail bucket
    const bucket = storage.bucket("yc-thumbnails-raw");
    // generate the file name for the thumbnail
    const fileName = `${data.videoName}.${data.fileExtension}`;
    const [url] = await bucket.file(fileName).getSignedUrl({
      // get the signed url for the file
      version: "v4", // specify the version of the signed url
      action: "write", // specify the action for the signed url
      expires: Date.now() + 15 * 60 * 1000,
      // set the expiration time for the signed url to 15 minutes
    });

    return {url, fileName}; // return the signed url and the file name
  });
