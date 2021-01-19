import AWS = require('aws-sdk');
import { config } from './config/config';

//Configure AWS
if(config.aws.profile !== "DEPLOYED"){
  var credentials = new AWS.SharedIniFileCredentials({profile: config.aws.profile});
  AWS.config.credentials = credentials
}

export const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: config.aws.region,
  params: {Bucket: config.aws.media_bucket}
});


/* getGetSignedUrl generates an aws signed url to retreive an item
 * @Params
 *    key: string - the filename to be retreived from the s3 bucket
 * @Returns:
 *    a url as a string
 */
export function getGetSignedUrl( key: string ): string {
  const signedUrlExpireSeconds: number = 60 * 5;
  const param: object = {
    Bucket: config.aws.media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds,
  };

  const url: string = s3.getSignedUrl('getObject', param);
  
  return url;
}

/* getPutSignedUrl generates an aws signed url to put an item
 * @Params
 *    key: string - the filename to be put into s3 bucket
 * @Returns:
 *    a url as a string
 */
export function getPutSignedUrl( key: string ): string {
  const signedUrlExpireSeconds: number = 60 * 5
  const param: object = {
    Bucket: config.aws.media_bucket,
    Key: key,
    Expires: signedUrlExpireSeconds,
  };

  const url: string = s3.getSignedUrl('putObject', param);

  return url;
}
