import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

// Initialize the Firebase Admin SDK
initializeApp({credential: credential.applicationDefault()}); // Initialize the Firebase Admin SDK with the default application credentials

// Create a Firestore instance
const firestore = new Firestore(); // Create a Firestore instance using the default project ID

const videoCollectionId = 'videos'; // Define the collection ID for the videos collection

// Define the video interface
export interface Video { // Define the Video interface with the following properties
    id?: string,
    uid?: string,
    filename?: string,
    status?: 'processing' | 'processed',
    title?: string,
    description?: string
    }

async function getVideo(videoId: string) {
        const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get(); // Get the video document with the specified ID
        return (snapshot.data() as Video ) ?? {}; // Return the video data if it exists, otherwise return an empty object
    }

export function setVideo(videoId: string, video: Video) {
        return firestore
          .collection(videoCollectionId)
          .doc(videoId)
          .set(video, { merge: true }); // Set the video document with the specified ID to the provided video data
    }

export async function isVideoNew(videoId: string) {
        const video = await getVideo(videoId); // Get the video data with the specified ID
        return video?.status === undefined; // Return true if the video status is undefined, indicating that the video is new
    }

// add a subcollection to the user document in the firestore database
export async function addVideoToUser(uid: string, videoId: string, video: Video) {
        return firestore
          .collection('users')
          .doc(uid)
          .collection('videos')
          .doc(videoId)
          .set(video); // Add the video document to the user's videos subcollection
    }
