import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles, isValidURL } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file
  app.get('/filteredimage', async (req: Request, res: Response) => {
    const { image_url } = <{ image_url: string }>req.query;
    if (!image_url) return res.status(400).send({ error: 'URL is required.'});
    if (!isValidURL(image_url)) return res.status(400).send({ error: 'Valid URL is required.' });
    try {
      const path: string = await filterImageFromURL(image_url);
      res.on('finish', async () => await deleteLocalFiles([path]));
      res.status(200).sendFile(path);
    } catch (error) {
      res.status(422).send({ error: "Unable to process image URL." });
    }
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen(port);
})();
