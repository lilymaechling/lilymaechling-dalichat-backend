// Reference: https://github.com/Automattic/mongoose/issues/1377#issuecomment-15911192

import express from 'express';

import { Posts, Users } from '../models';

import { searchController } from '../controllers';
import { requireAuth } from '../authentication';

const router = express();

router.route('/posts')
  .get(async (req, res) => {
    try {
      const {
        query, field, sortNum, page, numPerPage,
      } = searchController.parseQuery(req.query);

      const andArr = [];
      andArr.push(query
        ? {
          $or: [
            { content: { $regex: new RegExp(query, 'i') } },
          ],
        }
        : {});

      const queryObject = { $and: andArr };
      const sortObject = {};

      // Defaults to sorting by date
      if (field.toLowerCase() === 'likes') {
        sortObject.likes = sortNum;
      } else {
        sortObject.postDate = sortNum;
      }

      const results = await Posts.find(queryObject)
        .sort(sortObject)
        .skip((page - 1) * numPerPage)
        .limit(numPerPage)
        .populate({
          path: 'owner',
          select: '-password', // Removes password from populated objects
        });

      const resultIds = results.map((r) => { return r._id; });

      return res.status(200).json({ results, resultIds, numResults: results.length });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

router.route('/users')
  .get(async (req, res) => {
    try {
      const {
        query, sortNum, page, numPerPage,
      } = searchController.parseQuery(req.query);

      const andArr = [];
      andArr.push(query
        ? {
          $or: [
            { username: { $regex: new RegExp(query, 'i') } },
            { firstName: { $regex: new RegExp(query, 'i') } }, // Virtuals not saved in DB, use firstName and lastName
            { lastName: { $regex: new RegExp(query, 'i') } },
            { blurb: { $regex: new RegExp(query, 'i') } },
          ],
        }
        : {});

      const queryObject = { $and: andArr };

      const results = await Users.find(queryObject, { password: 0 }) // ! Remove password from query
        .sort({ firstName: sortNum })
        .skip((page - 1) * numPerPage)
        .limit(numPerPage);

      // Manually limit posts per user to get correct numPosts virtual
      const updatedResults = results.map((result) => {
        return Object.assign(result, { posts: result.posts.slice(0, 2) });
      });

      // Gets all posts (populated) referenced by queried user objects
      const postResults = await updatedResults.reduce(async (accum, r) => {
        const newAccum = await accum;
        return [...newAccum, ...(await Posts
          .find({ _id: { $in: r.posts } })
          .populate({ path: 'owner', select: '-password' })
        )];
      }, []);

      const resultIds = updatedResults.map((r) => { return r._id; });

      return res.status(200).json({
        results: updatedResults, resultIds, postResults, numResults: results.length,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

router.route(requireAuth, '/users')
  .get(async (req, res) => {});

export default router;
