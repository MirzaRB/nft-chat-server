import { NextFunction, Request, Response } from 'express';
import { TopicSchema } from '../../schema/topic/topic.schema';
import { CustomRequest } from '../../interfaces/common.interface';
import { TopicMemberSchema } from '../../schema/topicMembers/topicMembers.schema';
import mongoose from 'mongoose';
import { ListMembersSchema } from '../../schema/listMembers/listMembers.schema';
import { FollowerSchema } from '../../schema/follower/follower.schema';
import { object } from 'joi';
import { MessageSchema } from '../../schema/message/message.schema';
class TopicController {
  public getGlobalTopic = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const topic = await TopicSchema.findOne({
        type: { $in: ['GLOBAL'] },
      });
      return res.status(200).json({ success: true, data: topic });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
  public createTopic = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const topic = await TopicSchema.create(req.body);
      topic.createdBy = req.reqUser.id;
      await topic.save();
      await this.addTopicMemberFunc(req.reqUser.id, topic._id, topic.createdBy);
      if (req.body.audience === 'DAO_LIST') {
        const listMembers = await ListMembersSchema.find({ listId: topic.daoListId });
        console.log('listMembers ', listMembers);
        listMembers.forEach(async (member: any) => {
          await this.addTopicMemberFunc(member.memberId, topic._id, topic.createdBy);
        });
      }
      if (req.body.audience === 'FOLLOWED') {
        const followers = await FollowerSchema.find({ followedTo: req.reqUser.id });
        console.log('followerExist ', followers);
        followers.forEach(async (member: any) => {
          await this.addTopicMemberFunc(member.followedBy, topic._id, topic.createdBy);
        });
      }
      return res.status(200).json({ success: true, data: topic });
    } catch (error: any) {
      console.log('error ', error);
      return res.status(400).json({ success: false, message: error.message });
    }
  };
  public getAllTopics = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const pageNo = parseInt(req.query.pageNo as string) || 1;
      const skip = (pageNo - 1) * pageSize;
      let isJoinedObj = {};
      let pipeline: any = [];
      let userIdd: any;
      if (req.reqUser) {
        userIdd = req.reqUser.id;
      }

      if (userIdd) {
        isJoinedObj = {
          isJoined: {
            $cond: {
              if: {
                $or: [
                  { $in: [new mongoose.Types.ObjectId(userIdd), '$members.memberId'] }, // For audience: PUBLIC
                  { $eq: ['$createdBy', new mongoose.Types.ObjectId(userIdd)] }, // For createdBy
                ],
              },
              then: true,
              else: false,
            },
          },
          isPrivate: {
            $cond: {
              if: {
                $ne: ['$audience', 'PUBLIC'],
              },
              then: true,
              else: false,
            },
          },
          isOwned: {
            $cond: {
              if: {
                $eq: ['$createdBy._id', [new mongoose.Types.ObjectId(userIdd)]],
              },
              then: true,
              else: false,
            },
          },
        };
        const commonCondition = [
          { 'members.memberId': new mongoose.Types.ObjectId(userIdd) },
          {
            createdBy: new mongoose.Types.ObjectId(userIdd),
          },
        ];
        pipeline = [
          {
            $lookup: {
              from: 'topicMembers',
              localField: '_id',
              foreignField: 'topicId',
              as: 'members',
            },
          },
          {
            $match: {
              $and: [
                {
                  $or: [
                    { audience: 'FOLLOWED', $or: commonCondition },
                    {
                      audience: 'DAO_LIST',
                      $or: commonCondition,
                    },
                    {
                      audience: 'PUBLIC',
                    },
                  ],
                },
                { status: { $eq: 'PUBLISHED' } },
                { type: { $nin: ['GLOBAL'] } },
              ],
            },
          },
        ];

        console.log('req =========>', req.reqUser);
      } else {
        pipeline = [
          {
            $match: {
              audience: 'PUBLIC',
              status: { $eq: 'PUBLISHED' },
              type: { $nin: ['GLOBAL'] },
            },
          },
          {
            $lookup: {
              from: 'messages',
              let: { topicId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$topicId', '$$topicId'] },
                        { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                      ],
                    },
                  },
                },
                { $sort: { createdAt: -1 } },
                { $limit: 1 },
              ],
              as: 'lastMessage',
            },
          },
        ];
      }

      // Add search functionality
      const searchQuery = req.query.search;
      if (searchQuery) {
        pipeline.push({
          $match: {
            $or: [
              { topicName: { $regex: searchQuery, $options: 'i' } },
              // Add more fields for search if needed
            ],
          },
        });
      }

      const data = await TopicSchema.aggregate([
        ...pipeline,
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy',
          },
        },
        //
        // {
        //   $sort: {
        //     'members.createdAt': -1,
        //     'members.topicCreatedBy': -1,

        //     // createdAt: -1,
        //   },
        // },

        {
          $project: {
            topicName: 1,
            createdAt: 1,
            mainDescription: 1,
            audience: 1,
            allowMint: 1,
            uploadImagesUrl: 1,
            thumbnailUrl: 1,
            topicRules: 1,
            smartAddress: 1,
            status: 1,
            createdBy: {
              _id: 1,
              userName: 1,
              displayName: 1,
              profileImageUrl: 1,
            },
            lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
            ...isJoinedObj,
          },
        },
        {
          $sort: {
            isPrivate: -1,
            isOwned: -1,
            isJoined: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);

      return res.status(200).json({ success: true, data: data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public updateTopic = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const updateTopic = await TopicSchema.findByIdAndUpdate(req.body.topicId, req.body, { new: true });
      console.log('Topic updated successfully', updateTopic);
      return res.status(200).json({ success: true, message: 'Topic updated successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public getTopicById = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      let pipeline: any = [];
      if (req.reqUser) {
        const userId = req.reqUser.id;
        pipeline = [
          {
            $lookup: {
              from: 'pinned',
              let: { topicId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $and: [{ $eq: ['$userId', userId] }, { $eq: ['$topicId', '$$topicId'] }] },
                  },
                },
              ],
              as: 'pinned',
            },
          },
          {
            $addFields: {
              isPinned: { $cond: { if: { $gt: [{ $size: '$pinned' }, 0] }, then: true, else: false } },
            },
          },
          {
            $addFields: {
              isJoined: { $in: [new mongoose.Types.ObjectId(userId), '$members.memberId'] },
              isOwned: {
                $cond: {
                  if: {
                    $eq: ['$createdBy._id', [new mongoose.Types.ObjectId(userId)]],
                  },
                  then: true,
                  else: false,
                },
              },
              isPrivate: {
                $cond: {
                  if: { $eq: ['$audience', 'PUBLIC'] },
                  then: false,
                  else: true,
                },
              },
            },
          },
        ];
      }
      // Assuming you have the user ID in the request object
      const topic = await TopicSchema.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy',
          },
        },
        {
          $lookup: {
            from: 'topicMembers',
            localField: '_id',
            foreignField: 'topicId',
            as: 'members',
          },
        },
        ...pipeline,

        {
          $project: {
            topicName: 1,
            createdAt: 1,
            mainDescription: 1,
            audience: 1,
            allowMint: 1,
            uploadImagesUrl: 1,
            thumbnailUrl: 1,
            topicRules: 1,
            smartAddress: 1,
            status: 1,
            createdBy: {
              _id: 1,
              userName: 1,
              displayName: 1,
              profileImageUrl: 1,
            },
            members: {
              _id: 1,
              memberId: 1,
            },
            isPinned: 1,
            isJoined: 1,
            isOwned: 1,
            isPrivate: 1,
          },
        },
      ]);
      return res.status(200).json({ success: true, data: topic });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public joinMember = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      let promises: any = [];
      const { topicId, memberId } = req.body;
      console.log('topicId ', topicId, memberId);
      const topic = await TopicSchema.findOne({ _id: topicId, status: 'PUBLISHED', audience: 'PUBLIC' });
      console.log('topic ', topic);

      if (!topic) return res.status(400).json({ success: false, message: 'Topic not found' });
      const memberExist = await TopicMemberSchema.find({ memberId: memberId, topicId: topicId });
      console.log('memberExist ', memberExist, memberExist.length);

      if (memberExist.length) return res.status(400).json({ success: false, message: 'Member already exist' });
      const topicMember = await this.addTopicMemberFunc(memberId, topic._id, topic.createdBy);

      const followerExist = await FollowerSchema.find({ followedBy: memberId }, { followedTo: topic.createdBy });
      console.log('followerExist ', followerExist.length);
      if (!followerExist.length) {
        const addToFollower = FollowerSchema.create({ followedBy: memberId, followedTo: topic.createdBy });
        promises = [topicMember, addToFollower];
      } else {
        promises = [topicMember];
      }
      await Promise.all(promises);

      return res.status(200).json({ success: true, message: 'Member joined successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public removeMember = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { memberId, topicId } = req.body;
      const memberExist = await TopicMemberSchema.findOne({ memberId: memberId }, { topicId: topicId });
      if (!memberExist) return res.status(400).json({ success: false, message: 'Member not found' });
      await TopicMemberSchema.deleteOne(memberExist._id);
      return res.status(200).json({ success: true, message: 'Member removed successfully' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public getTopicMembersAndCount = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      console.log('req.query ', req.query);
      const topicId = req.params.topicId;
      console.log('topicId ', topicId);
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const pageNo = parseInt(req.query.pageNo as string) || 1;
      const skip = (pageNo - 1) * pageSize;
      const pipeline: any = [
        {
          $match: {
            topicId: new mongoose.Types.ObjectId(topicId),
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'memberId',
            foreignField: '_id',
            as: 'members',
          },
        },
        {
          $project: {
            id: 1,
            members: { _id: 1, userName: 1, profileImageUrl: 1, displayName: 1 },
          },
        },
      ];
      const topicMembers = TopicMemberSchema.aggregate([
        ...pipeline,
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);
      const topicMembersCount = TopicMemberSchema.countDocuments({ topicId: new mongoose.Types.ObjectId(topicId) });
      const [members, totalCount] = await Promise.all([topicMembers, topicMembersCount]);
      return res.status(200).json({
        success: true,
        data: members,
        count: totalCount,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public getMyOwnedContent = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const pageNo = parseInt(req.query.pageNo as string) || 1;
      const skip = (pageNo - 1) * pageSize;

      const pipeline: any = [
        {
          $match: {
            createdBy: req.reqUser.id,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy',
          },
        },
        {
          $project: {
            topicName: 1,
            createdAt: 1,
            mainDescription: 1,
            audience: 1,
            allowMint: 1,
            uploadImagesUrl: 1,
            topicRules: 1,
            smartAddress: 1,
            isEnded: 1,
            createdBy: {
              _id: 1,
              userName: 1,
              email: 1,
              profileImageUrl: 1,
            },
          },
        },

        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ];
      const topics = await TopicSchema.aggregate(pipeline);
      return res.status(200).json({ success: true, data: topics });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  public addTopicMemberFunc = async (memberId: any, topicId: any, topicCreatedBy: any): Promise<any> => {
    try {
      console.log('In addTopicMemberFunc === >', memberId, topicId, topicCreatedBy);
      await TopicMemberSchema.create({
        memberId: memberId,
        topicId: topicId,
        topicCreatedBy: topicCreatedBy,
      });

      return;
    } catch (error: any) {
      console.log('error ', error);
      return error;
    }
  };

  public getTrendingTopics = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const pipeline: any = [
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $lookup: {
            from: 'topics',
            localField: 'topicId',
            foreignField: '_id',
            as: 'topic',
          },
        },
        {
          $group: {
            _id: '$topicId',
            count: { $sum: 1 },
            topic: { $first: '$topic' },
          },
        },
        { $sort: { count: -1 } },
      ];
      const data = await MessageSchema.aggregate(pipeline);
      return res.status(200).json({ success: true, data: data[0].topic });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
}
export default TopicController;
