import Post from "../models/Post.js";
import Comments from "../models/Comment.js";
import cloudinary from "../config/cloudinary.js";

export const createPost = async(req , res) => {
  try{
    const { caption } = req.body;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "posts" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    if(!imageUrl){
      return res.status(400).json({ message: "post image required"})
    }
    const post = await Post.create({
      userId: req.user,
      caption, 
      imageUrl
    })

    res.status(201).json(post);
  }
  catch(err){
    console.error("createPost error:", err);
    return res.status(500).json({ message: "server error"});
  }
}

export const getPosts = async(req,res)=> {
  try {
    const posts = await Post.find()
        .populate("userId", "name email")
        .populate("comments")
        .sort({ createdAt: -1})

     res.json(posts);
  }
  catch ( error){
    console.error("getPosts error:", error.message)
    res.status(500).json({ message: "Server ERROr"})
  }
};


export const LikeUnlikePost = async (req,res)=> {
  try{
    const userId = req.user;
    const postId = req.params.id;

    const post= await Post.findById(postId);

    if(!post){
      return res.status(404).json({message: "no post found"})
    }

    const isLiked = post.likes.some(id => id.toString() === userId);
    
    let updatedPost;
    if(isLiked){
      updatedPost = await Post.findByIdAndUpdate(postId,{
        $pull: { likes: userId}
      },{ returnDocument: 'after'});
      return res.json(updatedPost);
    }
    else{
      updatedPost=await Post.findByIdAndUpdate(postId,{
        $push: { likes: userId}
      },{ returnDocument: 'after'});
      return res.json(updatedPost);
    }
    res.json(updatedPost);
  }
  catch(error){
    res.status(500).json({ message: error.message})
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Comments.deleteMany({ postId: postId });
    await Post.findByIdAndDelete(postId);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};