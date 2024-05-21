import { NextFunction, Request, Response } from 'express';
import { ListSchema } from '../../schema/list/list.schema';
import { CustomRequest } from '../../interfaces/common.interface';
import { ListMembersSchema } from '../../schema/listMembers/listMembers.schema';
import { TopicSchema } from '../../schema/topic/topic.schema';
import mongoose from 'mongoose';
import { TopicMemberSchema } from '../../schema/topicMembers/topicMembers.schema';
class ListController {
  public createList = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      console.log('createList', req.body);
      const { name, memberIdArray } = req.body;
      const newList = new ListSchema();
      newList.name = name;
      newList.createdBy = req.reqUser.id;

      await newList.save();

      if (newList) {
        const listId = newList._id;
        memberIdArray.forEach((memberId: string) => {
          const addListMember = ListMembersSchema.create({
            listId: listId,
            memberId: memberId,
            listCreatedBy: newList.createdBy,
          });
          console.log('addListMember', addListMember);
        });
      }
      console.log('List created successfully', newList);
      return res.status(200).json({ success: true, data: newList });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public getAllLists = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const pageNo = parseInt(req.query.pageNo as string) || 1;
      const skip = (pageNo - 1) * pageSize;
      const lists = await ListSchema.find(
        {
          createdBy: req.reqUser.id,
        },
        {
          _id: 1,
          name: 1,
        },
        {
          sort: { createdAt: -1 },
          skip: skip,
          limit: pageSize,
        },
      );
      return res.status(200).json({ success: true, data: lists });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
  public deleteList = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const listMembers = ListMembersSchema.deleteMany({
        listId: req.params.listId,
        listCreatedBy: req.reqUser.id,
      });
      const list = ListSchema.deleteOne({
        _id: req.params.listId,
      });
      const topicMembers = TopicSchema.aggregate([
        {
          $match: {
            daoListId: new mongoose.Types.ObjectId(req.params.listId),
          },
        },
        {
          $lookup: {
            from: 'topicMembers',
            localField: '_id',
            foreignField: 'topicId',
            as: 'topicMembers',
          },
        },

        {
          $project: {
            topicMembers: {
              _id: 1,
              topicId: 1,
              memberId: 1,
            },
          },
        },
      ]);

      const removingTopicMembers = (await topicMembers).map(async (memberInfo: any) => {
        await memberInfo.topicMembers.map(async (member: any) => {
          await TopicMemberSchema.deleteOne({
            topicId: member.topicId,
            memberId: member.memberId,
          });
        });
      });

      await Promise.all([listMembers, list, topicMembers, removingTopicMembers]);
      return res.status(200).json({ success: true, message: 'List deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
}
export default ListController;
