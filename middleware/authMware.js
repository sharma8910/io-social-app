import jwt from "jsonwebtoken";

const authMware = (req ,res,next)=> {
  try{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
      return res.status(401).json({ message: "no token provided"});
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Token received:", token);
    console.log("JWT Secret:", process.env.JWT_SECRET);

    const decoded =jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.id;

    next();


  } catch(err){
    res.status(401).json({message: 'Token invalid'})
  }
};

export default authMware;