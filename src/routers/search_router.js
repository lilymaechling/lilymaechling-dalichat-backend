import express from 'express';

import { Posts, Users } from '../models';

import { searchController } from '../controllers';
import { requireAuth } from '../authentication';

const router = express();

// router.route('/')
//   // Main query-based search
//   .get(async (req, res) => {
//     try {
//       // Add any additional filters here. NOTE: Shorten these for cleanliness in URL
//       const { query, maxValue } = req.query; // Params that don't need defaults
//       const sort = req.query.sort || 'a'; // Params that need defaults

//       // Parse strings to numbers
//       const page = parseInt(req.query.page, 10) || 1;
//       const numPerPage = parseInt(req.query.numperpage, 10) || 10;

//       const queryObject = {
//         $and: [
//           // Query title and description if query sting exists
//           query ? {
//             $or: [
//               { title: { $regex: new RegExp(query, 'i') } }, // Note: regexp can become inefficient for large collections, look into indexing
//               { content: { $regex: new RegExp(query, 'i') } }, // See here: https://stackoverflow.com/questions/7101703/how-do-i-make-case-insensitive-queries-on-mongodb
//             ],
//           } : {},
//           // {
//           //   $and: [
//           //     maxValue ? { value: { $lte: maxValue } } : {}, // Only implement if maxValue is defined
//           //     // Implement additional filters here
//           //   ],
//           // },
//         ],
//       };

//       // Call search() controller with generated parameters
//       const results = await searchController.search(queryObject, sort, page, numPerPage);
//       return res.status(200).json({ results, numResults: results.length });
//     } catch (error) {
//       return res.status(500).json({ message: error.message });
//     }
//   });

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

      console.log({
        query, sortNum, page, numPerPage,
      });

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
        .limit(numPerPage)
        .populate('posts');
        // .slice('posts', 2);

      // Populating subfields, see here https://github.com/Automattic/mongoose/issues/1377#issuecomment-15911192
      const populatedResults = await Users.populate(
        results, {
          path: 'posts.owner',
          model: Users,
        },
      );

      // Manually limit posts per user to get correct numPosts virtual
      const updatedResults = populatedResults.map((result) => {
        // eslint-disable-next-line prefer-object-spread
        // return Object.assign(result, { posts: result.posts.slice(2) });
        return result;
      });

      const resultIds = updatedResults.map((r) => { return r._id; });

      return res.status(200).json({ results: updatedResults, resultIds, numResults: updatedResults.length });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

router.route(requireAuth, '/users')
  .get(async (req, res) => {});

export default router;
