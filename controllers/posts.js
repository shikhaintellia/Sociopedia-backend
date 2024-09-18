import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
// export const createPost = async (req, res) => {
//   try {
//     const { userId, description, picturePath } = req.body;
//     const user = await User.findById(userId);
//     const newPost = new Post({
//       userId,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       location: user.location,
//       description,
//       userPicturePath: user.picturePath,
//       picturePath,
//       likes: {},
//       comments: [],
//     });
//     await newPost.save();

//     const post = await Post.find();
//     res.status(201).json(post);
//   } catch (err) {
//     res.status(409).json({ message: err.message });
//   }
// };
export const createPost = async (req, res) => {
  try {
    const { userId, description } = req.body;
    const picturePath = req.files['picture'] ? req.files['picture'][0].path : null;
    const attachmentPath = req.files['attachment'] ? req.files['attachment'][0].path : null;

    const newPost = new Post({
      userId,
      description,
      picturePath,
      attachmentPath,
    });

    await newPost.save();

    // Retrieve all posts to return them
    const posts = await Post.find();
    res.status(201).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
    console.log("Posts",post)
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE - To like the posts*/
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//To comment over the posts
export const comment= async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, comment } = req.body;

   
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add the new comment to the post's comments array
    post.comments.push({ userId, comment });

    // Save the updated post
    const updatedPost = await post.save();

    // Respond with the updated post
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
