import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { name, email, password, imageUrl } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "user alerady exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      imageUrl,
    });

    const token = jwt.sign({
      id: user._id
    }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      message: " user registered",
    
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "nhi hai register" });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );
    console.log("Token:", token);
    res.json({
      message: "login done",
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
