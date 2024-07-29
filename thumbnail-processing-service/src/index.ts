import express from "express";
import jimp from "jimp";
import { deleteProcessedThumbnail, deleteRawThumbnail, downloadRawThumbnail, generateProcessedThumbnail, setUpDirectories, uploadProcessedThumbnail } from "./storage";

setUpDirectories(); // Call the setUpDirectories function to create the local directories for raw and processed thumbnails

const app = express();
app.use(express.json());

app.post("/process-thumbnail", async (req, res) => { // post request to process the thumbnail
  // get the bucket and file name from the cloud pub/sub message
  // when a file is uploaded to the raw thumbnail bucket, a message is sent to the cloud pub/sub topic, which triggers the cloud function to send a message to this endpoint
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


  const inputFileName = data.name; // get the name of the input file
  const outputFileName = inputFileName.replace(inputFileName .split('.').pop(), "png"); // get the name of the output file by replacing the file extension with png
  
  await downloadRawThumbnail(inputFileName); // download the raw thumbnail from cloud storage
  // jimp.read(inputFilePath, (err, image) => { // read the input file
  //   if (err) { // if there is an error
  //     console.error(err); // log the error
  //     return res.status(500).send("Internal server error"); // return an internal server error
  //   }
// 
  //   image.write(outputFilePath, (err) => { // write the resized image to the output file
  //       if (err) { // if there is an error
  //         console.error(err); // log the error
  //         return res.status(500).send("Internal server error"); // return an internal server error
  //       }
// 
  //       console.log(`Thumbnail processed and saved to ${outputFilePath}`); // log that the thumbnail has been processed and saved
  //       return res.status(200).send("Thumbnail processed successfully"); // return a success status
  //     });
  // });
  // process the thumbnail with a try catch block
  try {
    await generateProcessedThumbnail(inputFileName, outputFileName); // generate the processed thumbnail
  }
  catch (err) {
    await Promise.all([ // Use Promise.all to wait for both delete operations to complete
      deleteRawThumbnail(inputFileName),
      deleteProcessedThumbnail(outputFileName) // Delete the raw and processed thumbnail files if an error occurs during thumbnail processing
    ]);
    console.error(err); // log the error
    return res.status(500).send("Internal server error"); // return an internal server error
  }

  await uploadProcessedThumbnail(outputFileName); // upload the processed thumbnail to cloud storage

  await Promise.all([ // Use Promise.all to wait for both delete operations to complete
    deleteRawThumbnail(inputFileName),
    deleteProcessedThumbnail(outputFileName) // Delete the raw and processed thumbnail files
    ]);
  
  return res.status(200).send("Thumbnail processed successfully"); // return a success status
});


const port = process.env.PORT || 3000; //  set default port to listen
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});