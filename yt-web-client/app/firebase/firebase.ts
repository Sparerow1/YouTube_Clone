// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, 
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    User
    } from "firebase/auth";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  authDomain: "yt-clone-8c37c.firebaseapp.com",
  projectId: "yt-clone-8c37c",
  appId: "1:751663607826:web:61ff652f81277ac70ee8cb",
  measurementId: "G-Z1SRTMM51Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); //initializeApp is a method of the firebase object and it initializes the firebase app with the firebase configuration


const auth = getAuth(app);//auth object is used to sign in and sign out the user
export const functions = getFunctions(); //getFunctions is a method of the firebase object and it returns the functions object
/**
 * Sign the user in with a google popup
 * @returns A promise that resolves with the user's credentials
 */ 

export function signInWithGoogle(){
    return signInWithPopup(auth, new GoogleAuthProvider()); //signInWithPopup is a method of the auth object and it returns a promise that resolves with the user's credentials
}

/**
 * Signs the user out
 * @returns a promise that resolves when the user is signed out
 */

export function signOut(){
    return auth.signOut(); //signOut is a method of the auth object and it returns a promise that resolves when the user is signed out
}


/**
 * Triggers a callback when the user auth state changes
 * @returns a function that unsubscribes the callback
 */

export function onAuthStateChangedHelper(callback: (user: User | null)=> void){
    return onAuthStateChanged(auth, callback); //onAuthStateChanged is a method of the auth object and it triggers a callback when the user auth state changes
}

export function getAuthenticatdUser(){
    return auth.currentUser; //currentUser is a property of the auth object and it returns the currently authenticated user
}

