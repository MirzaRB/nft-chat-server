import { NextFunction, Request, Response } from 'express';
import { PinSchema } from '../../schema/pin/pin.schema';
import { CustomRequest } from '../../interfaces/common.interface';
class PinController {
  public topicPinned = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { topicId } = req.body;
      const pinData = new PinSchema();
      pinData.topicId = topicId;
      pinData.userId = req.reqUser.id;
      await pinData.save();
      console.log('Topic pinned successfully', pinData);
      return res.status(200).json({ success: true, data: pinData });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public getAllPinnedTopics = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const pageNo = parseInt(req.query.pageNo as string) || 1;
      const skip = (pageNo - 1) * pageSize;
      const pinnedTopics = await PinSchema.find(
        {
          userId: req.reqUser.id,
        },
        {},
        {
          sort: { createdAt: -1 },
          skip: skip,
          limit: pageSize,
        },
      ).populate({
        path: 'topicId',
        populate: {
          path: 'createdBy',
          select: 'userName profileImageUrl displayName ', // Specify the fields you want to retrieve
        },
        // Specify the fields you want to retrieve
      });
      return res.status(200).json({ success: true, data: pinnedTopics.map((item) => item.topicId) });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public removePinnedTopic = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { topicId } = req.params;
      await PinSchema.deleteOne({
        topicId: topicId,
        userId: req.reqUser.id,
      });
      return res.status(200).json({ success: true, message: 'Topic unpinned successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
}
export default PinController;
