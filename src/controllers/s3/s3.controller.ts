import { NextFunction, Request, Response } from 'express';
// import { UserRequest } from '../interfaces';
import S3Service from '../../utils/S3.service';

import { CustomRequest } from '../../interfaces/common.interface';

class S3Controller {
  private s3Service = new S3Service();
  private sliceSize = 1024 * 1024 * 8;

  public generateSignedUrl = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { fileName } = req.query;

      const signedUrl = await this.s3Service.createSignedUrl(fileName as string);
      console.log('signedUrl', signedUrl);
      return res.status(200).json({ success: true, data: { signedUrl, objectUrl: signedUrl.split('?')[0] } });
    } catch (error: any) {
      next(error);
    }
  };
}

export default S3Controller;
