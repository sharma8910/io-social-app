import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const getUserProfile = async (req, res) => {
  try{
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-password");

     if(!user){
      return res.status(401).json({ message: "no profile" });
     }

     res.json(user)

    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req,res) => {
  try{
     const userId = req.params.id; 
     const { name } = req.body;
     let imageUrl = req.body.imageUrl;
     
     if(req.user && req.user.toString() !== userId) {
      return res.status(403).json({
        message: "not allowed"
      });
     }

     if (req.file) {
       const result = await new Promise((resolve, reject) => {
         const stream = cloudinary.uploader.upload_stream(
           { folder: "profiles" },
           (error, result) => {
             if (result) resolve(result);
             else reject(error);
           }
         );
         stream.end(req.file.buffer);
       });
       imageUrl = result.secure_url;
     }

     const updateData = {};
     if (name) updateData.name = name;
     if (imageUrl) updateData.imageUrl = imageUrl;

     const updateUser = await User.findByIdAndUpdate(userId,
      updateData,
      {new: true}
     ).select("-password");

     if(!updateUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    res.json({
      message: "profile UODATE",
      updateUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
};

export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize arrays if they do not exist
    if (!targetUser.followers) targetUser.followers = [];
    if (!currentUser.following) currentUser.following = [];

    const isFollowing = targetUser.followers.some(
      (id) => id.toString() === currentUserId.toString()
    );

    if (isFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId.toString()
      );
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId.toString()
      );
      await targetUser.save();
      await currentUser.save();
      return res.json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);
      await targetUser.save();
      await currentUser.save();
      return res.json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const aiUser = await User.findOne({ email: "ai@io.social" }).select("-password");
    
    const query = { _id: { $ne: req.user } };
    if (aiUser) {
      query.email = { $ne: "ai@io.social" };
    }
    
    const otherUsers = await User.find(query).select("-password").limit(4);
    
    const combinedUsers = [];
    if (aiUser) {
      combinedUsers.push(aiUser);
    }
    combinedUsers.push(...otherUsers);
    
    res.json(combinedUsers);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

