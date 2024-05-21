import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
// import { SignedUrlObj } from '../interfaces';
import { createRequest } from '@aws-sdk/util-create-request';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class S3Service {
  private s3Client: S3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY || '',
      secretAccessKey: process.env.AWS_BUCKET_SECRET_KEY || '',
    },
  });
  private bucketName = process.env.AWS_BUCKET_NAME;

  public createSignedUrl = async (fileName: string): Promise<any> => {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });
      await createRequest(this.s3Client, command);
      const signedUrl = await getSignedUrl(this.s3Client, command);
      console.log('signedUrl', signedUrl);
      return signedUrl;
    } catch (error: any) {
      throw new Error(error?.message ?? 'Error in creating signed url');
    }
  };
}

export default S3Service;
