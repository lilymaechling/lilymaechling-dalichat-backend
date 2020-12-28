import { Posts } from '../models';

function parseQuery(reqQuery) {
  const { query } = reqQuery;
  const field = reqQuery.field ? reqQuery.field.toLowerCase() : '';
  const sortNum = (reqQuery.sort || 'a') === 'a' ? -1 : 1;
  const page = parseInt(reqQuery.page, 10) || 1;
  const numPerPage = parseInt(reqQuery.numperpage, 10) || 5;

  return ({
    query, field, sortNum, page, numPerPage,
  });
}

async function search(queryObject, sort, page, numPerPage) {
  const results = await Posts.find(queryObject) // Return all results (within limits) if no query
    .sort({ title: sort === 'a' ? -1 : 1 }) // Sort by title
    .skip((page - 1) * numPerPage) // Start at the beginning of the "page"
    .limit(numPerPage) // Limit to the end of the "page"

    // Reference: https://mongoosejs.com/docs/populate.html#setting-populated-fields
    .populate({
      path: 'owner',
      select: '-password', // Removes password from populated objects
    }); // ! BE CAREFUL WITH PASSWORDS

  return results;
}

const searchController = { search, parseQuery };

export default searchController;
