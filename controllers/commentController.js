import Comments from "../models/Comment.js";
import Post from "../models/Post.js";

export const addComment = async (req,res)=> {
  try{
    const userId = req.user;
    const postId= req.params.id;
    const { text }= req.body;


    if(!text) {
      return res.status(400).json({message: "Comment required"})
    }

    const comment= await Comments.create({
      userId,
      postId,
      text,
    });


    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id}
    });
    res.status(201).json({
      message: "Comment added",
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getComment = async ( req, res)=> {
  try{
    const postId= req.params.id;

    const comments = await Comments.find({ postId })
      .populate("userId", "name")
      .sort({ createdAt: -1});


    res.json(comments)
  }catch (error){
    res.status(500).json({ message: error.message});
  }
}



















