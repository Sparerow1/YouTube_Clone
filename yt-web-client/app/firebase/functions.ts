import { getFunctions, httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import axios from "axios";
//import {Storage} from "@google-cloud/storage";



const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl'); //httpsCallable is a method of the functions object and it returns a function that can be called with the data to send to the function
const getVideosFunction = httpsCallable(functions, 'getVideos');
const getVideosByUserFunction = httpsCallable(functions, 'getVideosByUser');
const editVideoFunction = httpsCallable(functions, 'editVideo');
const generateThumbnailUrl = httpsCallable(functions, 'generateThumbnailUrl');
//const storage = new Storage(); // initialize the storage object

export interface Video {
    id?: string,
    uid?: string,
    filename?: string,
    status?: 'processing' | 'processed',
    title?: string,
    description?: string  
}

export async function uploadVideo(file: File) {
    const response: any = await generateUploadUrl({ //generateUploadUrl is a function that can be called with the data to send to the function
        fileExtension: file.name.split('.').pop() // get the file extension of the file
        
    });
    //Upload the file via the signed URL
    await fetch(response?.data?.url, { 
        method: 'PUT', 
        body: file,
        headers: {
            'Content-Type': file.type
        }
    }) 

    return;
}

export async function getVideos() {
    const response = await getVideosFunction(); 
    // Call the getVideos function to get the list of videos
    return response.data as Video[];
}

export async function getThumbnail(video: Video) {
    return `https://storage.googleapis.com/yc-thumbnails/${video.filename}.png`; //get the thumbnail of the video
}

export async function getVideosByUser(uid: string) {
    const response = await getVideosByUserFunction({uid});
    // Call the getVideosByUser function to get the list of videos uploaded by the user
    return response.data as Video[];
}

export async function editVideo(video: Video) {
    const response = await editVideoFunction(video);
    // Call the editVideo function to edit the video
    return response.data as Video;
}

export async function changeThumbnail(videoName: string, file: File, uid: string) {
    const response: any = await generateThumbnailUrl({
        videoName,
        fileExtension: file.name.split('.').pop(),
        uid
    });
    // const formData = new FormData(); // create a new FormData object
    // formData.append('file', file); // append the file to the FormData object
    // formData.append('filename', response?.data?.filename); // append the filename to the FormData object
    const config = { // create a config object
        headers: {
            'content-type': file.type // set the content type header to the file type
        }
    }
    const url = response?.data?.url; // get the signed URL from the response

    //Upload the file via the signed URL
    //await axios.put(url, file, config)
    //    .then((response) => {
    //        console.log(response.data);
    //        });
    //
    //return;

        //Upload the file via the signed URL
        await fetch(response?.data?.url, { 
            method: 'PUT', 
            body: file,
            headers: {
                'Content-Type': file.type
            }
        }) 
    
        return;
}