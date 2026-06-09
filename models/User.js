import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
  name : {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minimum: 6,

  },
  imageUrl:{
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpiresAt: {
    type: Date
  },
  resetOtp: {
    type: String
  },
  resetOtpExpiresAt: {
    type: Date
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }
  ]
},{timestamps: true})

userSchema.methods.comparePassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password);
}
const User = mongoose.model('User', userSchema);
export default User;