// Reference: https://github.com/Automattic/mongoose/issues/1377#issuecomment-15911192

import { Router } from 'express';
import { searchController } from '../controllers';

const router = Router();

router.route('/posts')
  .get(async (req, res, next) => {
    try {
      const {
        query, field, sortNum, page, numPerPage,
      } = searchController.parseQuery(req.query);

      const results = await searchController.postSearch(query, field, sortNum, page, numPerPage);
      const resultIds = results.map((r) => { return r._id; });
      const numResults = results.length;

      return res.status(200).json({ results, resultIds, numResults });
    } catch (error) {
      return next(error);
    }
  });

router.route('/users')
  .get(async (req, res, next) => {
    try {
      const {
        query, sortNum, page, numPerPage,
      } = searchController.parseQuery(req.query);

      const { results, postResults } = await searchController.userSearch(query, sortNum, page, numPerPage);
      const resultIds = results.map((r) => { return r._id; });
      const numResults = results.length;

      return res.status(200).json({
        results, resultIds, postResults, numResults,
      });
    } catch (error) {
      return next(error);
    }
  });

export default router;
