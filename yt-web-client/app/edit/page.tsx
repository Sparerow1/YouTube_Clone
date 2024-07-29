"use client";
import styles from "./edit.module.css";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { changeThumbnail, editVideo, Video } from "../firebase/functions";
import { getAuthenticatdUser } from "../firebase/firebase";



export default function Edit() { // create the edit page component
    const [title, setTitle] = useState(""); // set the title state
    const [description, setDescription] = useState(""); // set the description state
    const [thumbnail, setThumbnail] = useState<File>(); // set the thumbnail state
    const video = useSearchParams().get("v"); // get the video source from the search params
    const user = getAuthenticatdUser();   // get the authenticated user
    const uid = user?.uid ?? ''; // get the uid of the user that is currently logged in, if it's null, assign an empty object
    const videoRaw = video?.split('rocessed-')[1]; 
    const userId = videoRaw?.split('-')[0]; // get the user id from the video source
    const videoId = videoRaw?.split('.')[0]; // get the video id from the video source

    function handleTitleChange(event : React.ChangeEvent<HTMLInputElement>) { // create the handleTitleChange function
        setTitle(event.target.value); // set the title state to the value of the input field
    }
    
    function handleDescriptionChange(event : React.ChangeEvent<HTMLTextAreaElement>) { // create the handleDescriptionChange function
        setDescription(event.target.value); // set the description state to the value of the input field
    }
    
    function handleThumbnailChange(event : React.ChangeEvent<HTMLInputElement>) { // create the handleThumbnailChange function
        const file =  event.target.files?.item(0); // get the first file selected
        if (file) {
            setThumbnail(file); // set the thumbnail state to the first file selected
        }
    }
    function handleUpload(file: File) { // create the handleUpload function
        try {
            if (video){
                const response = changeThumbnail(video, file, uid); // call the editVideo function with the file
                alert(`Thumbnail uploaded successfully! 
                    
                    Response: ${JSON.stringify(response)}`); // display an alert with the response message
                }
        }
        catch (error) {
            alert(`Failed to upload thumbnail: ${error}`); // display an alert if the video upload fails
        }
    }
    
    function handleSubmit(event : React.FormEvent<HTMLFormElement>) { // create the handleSubmit function
        event.preventDefault(); // prevent the default form submission behavior
        console.log(title, description, thumbnail); // log the title, description, and thumbnail states
        // alert(`Title: ${title}, Description: ${description}, uid: ${userId}, id: ${videoId}`); // display an alert with the title, description, and thumbnail states
        try {
            if (thumbnail) {
                handleUpload(thumbnail); // call the handleUpload function with the event and thumbnail state
            }
            const response = editVideo({title, description, uid: userId, id: videoId}); // call the editVideo function with the title, description, userId, and videoId
            alert(`Video edited successfully! 
                
                Response: ${JSON.stringify(response)}`); // display an alert with the response message
        } catch (error) {
            console.error(error); // log any errors that occur
        }
    }

    return (
        <div className="Page">
            <h1 className={styles.title}>Edit Page</h1>
        <fieldset className={styles.fieldset}>
            <form onSubmit={handleSubmit}>
                <label className={styles.label}> 
                    Title of the video:
                    <input type = "text" onChange={handleTitleChange} className={styles.videoTitle}/>

                    Description of the video:
                    <textarea onChange={handleDescriptionChange} className={styles.descriptionTitle}/>

                    Thumbnail of the video:
                    <input type = "file" accept="image/*" onChange={handleThumbnailChange} className={styles.thumbnailUpload}/>                   
                </label>
                <button type = "submit" className={styles.submitButton}>Submit</button>
            </form>
        </fieldset>
        </div>
    );
}




