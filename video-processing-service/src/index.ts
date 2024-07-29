import express from 'express';
import { convertVideo, deleteProcessedVideo, deleteRawVideo, deleteThumbnail, downloadRawVideo, generateThumbnail, setUpDirectories,  uploadThumbnail,  uploadVideo } from './storage';
import { addVideoToUser, isVideoNew, setVideo } from './firestore';

setUpDirectories(); // Call the setUpDirectories function to create the local directories for raw and processed videos
// write the express server code here
const app = express(); // Create an express instance as app
app.use(express.json()); // Enable JSON body parsing

app.post('/process-video', async (req, res) => {
  //get the bucket and file name from the cloud pub/sub message
  // when a flie is uploaded to the raw video bucket, a message is sent to the cloud pub/sub topic, which triggers the cloud function to send a message to this endpoint
  let data;  // Define a variable to store the message data
  try {
    const message = Buffer.from(req.body.message.data, 'base64').toString('utf8'); // Get the message from the request body
    data = JSON.parse(message); // Parse the message to get the bucket and file name
    if (!data.name) {
      throw new Error('Invalid message payload received'); // Throw an error if the message payload is invalid
    }
  } catch (error) { // Catch any errors that occur during message processing
    console.error(error); // Log the error
    return res.status(400).send('Bad request: missing file name'); // Return a bad request status if the message is invalid
  }


  const inputFileName = data.name; // Get the name of the input file
  const outputFileName = `processed-${inputFileName}`; // Define the name of the output file
  const videoId = inputFileName.split('.')[0]; // Get the video ID from the input file name
  const uid = videoId.split('-')[0]; // Get the video owner's UID from the video ID
  //check if the video is new
  if (!isVideoNew(videoId)) { // Check if the video is new by calling the isVideoNew function with the video ID
    return res.status(400).send('Bad Request: Video has already been processed or is currently processing'); // Return a bad request status if the video has already been processed
  } else {
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split('-')[0],
      status: 'processing'
    })
  }
  //download the raw video from cloud storage
  await downloadRawVideo(inputFileName) // Download the raw video from the cloud storage

  //process the video to 360p
  try{
    await convertVideo(inputFileName, outputFileName); // Process the video to 360p
  } catch (err) {
    await Promise.all([ // Use Promise.all to wait for both delete operations to complete
      deleteRawVideo(inputFileName), 
      deleteProcessedVideo(outputFileName)]); // Delete the raw and processed video files if an error occurs during video processing
    console.error(err); // Log the error
    return res.status(500).send('Internal server error'); // Return an internal server error if an error occurs during video processing
  }


  //upload the processed video to cloud storage
  await uploadVideo(outputFileName); // Upload the processed video to the cloud storage
  await generateThumbnail(outputFileName); // Generate a thumbnail for the processed video
  await uploadThumbnail(outputFileName); // Upload the thumbnail to the cloud storage
  //update the firestore with the processed video
  await setVideo(videoId, {
    status: 'processed',
    filename: outputFileName
  })
  
  await addVideoToUser(uid , videoId, {
    id: videoId,
    filename: outputFileName,
    status: 'processed'
  }); // Add the video to the user's videos subcollection in the firestore database

  await Promise.all([ // Use Promise.all to wait for both delete operations to complete
      deleteRawVideo(inputFileName), 
      deleteProcessedVideo(outputFileName), // Delete the raw and processed video files if an error occurs during video processing
      deleteThumbnail(outputFileName)]); // Delete the thumbnail file after processing is complete
       
  res.status(200).send('Video processed successfully'); // Return a success response if the video is processed successfully
});
//Did not put a return statement here because the processing is asynchronous, if a statement is returned here, it will be executed before the processing is completed.
const port = process.env.PORT || 3000; // Define the port number for the server if an environment variable PORT is defined, otherwise use port 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
