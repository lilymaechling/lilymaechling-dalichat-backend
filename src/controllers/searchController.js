import { Posts, Users } from '../models';

export const parseQuery = (reqQuery) => {
  const { query } = reqQuery;
  const field = reqQuery.field ? reqQuery.field.toLowerCase() : '';
  const sortNum = (reqQuery.sort || 'a') === 'a' ? -1 : 1;
  const page = parseInt(reqQuery.page, 10) || 1;
  const numPerPage = parseInt(reqQuery.numperpage, 10) || 5;

  return ({
    query, field, sortNum, page, numPerPage,
  });
};

export const postSearch = async (query, field, sortNum, page, numPerPage) => {
  const andArr = [];
  andArr.push(
    query
      ? { $or: [{ content: { $regex: new RegExp(query, 'i') } }] }
      : {},
  );

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

  return results;
};

export const userSearch = async (query, sortNum, page, numPerPage) => {
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
  // ! "await" needed, each iteration passes "accum" as a promise to the next iteration
  const postResults = await updatedResults.reduce(async (accum, r) => {
    const newAccum = await accum;
    return [...newAccum,
      ...(await Posts
        .find({ _id: { $in: r.posts } })
        .populate({ path: 'owner', select: '-password' })
      ),
    ];
  }, []);

  return { results, postResults };
};
