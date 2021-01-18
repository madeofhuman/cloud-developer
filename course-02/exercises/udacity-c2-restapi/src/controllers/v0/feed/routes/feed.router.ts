import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
  const items: { rows: FeedItem[], count: number } = await FeedItem.findAndCountAll({ order: [['id', 'DESC']] });
  items.rows.map((item) => {
    if (item.url) {
      item.url = AWS.getGetSignedUrl(item.url);
    }
  });

  return res.send(items);
});

// Get a specific resource by Primary Key
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).send({ "message": "Valid numerical id is required" });
  }

  try {
    const item: FeedItem = await FeedItem.findByPk(id);
    if (!item) {
      return res.status(404).send({ "message": "Item does not exist" });
    }
    if (item.url) {
      item.url = AWS.getGetSignedUrl(item.url);
    }

    return res.send(item);
  } catch (error) {
    console.error(error);

    return res.status(500).send({ "message": "Server error" });
  }
});

// Update a specific resource
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).send({ "message": "Valid numerical id is required" });
  }

  const { caption, url } = req.body;
  if (!caption && !url) {
    return res.status(400).send({ "message": "caption or body required" });
  }

  try {
    const [updatedCount, [updatedItem]] = await FeedItem.update({ caption, url }, { where: { id: id }, returning: true });
    if (updatedCount === 1) {
      if (url) {
        updatedItem.url = AWS.getGetSignedUrl(updatedItem.url);
      }
      console.log('Updated FeedItem: ', updatedItem.dataValues);

      return res.status(200).send(updatedItem)
    }
    console.error('Error updating FeedItem: ', { id });

    return res.status(500).send({ "message": "Server error" });
  } catch (error) {
    console.error('Fatal error updating FeedItem: ', { message: error.message });

    return res.status(500).send({ "message": "Server error" });
  }
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', requireAuth, async (req: Request, res: Response) => {
  let { fileName } = req.params;
  const url = AWS.getPutSignedUrl(fileName);

  return res.status(201).send({ url: url });
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const caption = req.body.caption;
  const fileName = req.body.url;

  // check Caption is valid
  if (!caption) {
    return res.status(400).send({ message: 'Caption is required or malformed' });
  }

  // check Filename is valid
  if (!fileName) {
    return res.status(400).send({ message: 'File url is required' });
  }

  const item = await new FeedItem({
    caption: caption,
    url: fileName
  });

  const saved_item = await item.save();

  saved_item.url = AWS.getGetSignedUrl(saved_item.url);

  return res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;
