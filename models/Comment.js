import mongoose from "mongoose";


const commentSchema= new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
},{timestamps: true});

const Comments = mongoose.model("Comment",commentSchema);
export default Comments;