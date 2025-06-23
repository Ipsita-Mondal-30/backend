import { asyncHandler } from "../utils/asynchandler.js";   
import { ApiErrorHandle } from "../utils/ApiErrorHandle.js";
import{ User } from "../models/users.models.js";
import { uploadFileCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation-not empty
    //check if user already exists:username,email
    //check for images,check for avatar
    //upload them to cloudinary,avatar
    //create user object -create entry in db
    //remove pass and refresh token from response 
    //check for user creation 
    //return res 

    const {fullName,email,password,username}=req.body
    console.log("email",email);

    if([fullName,email,password,username].some((field)=> field?.trim() === "" )){
        throw new ApiErrorHandle(400,"All fields are required")
    }

    if (!email || !username) {
        throw new ApiErrorHandle(400, "Email and Username are required");
      }
      
      const existedUser = await User.findOne({
        $or: [{ email }, { username }]
      });
      
    if(existedUser){
        throw new ApiErrorHandle(409,"User with email or username already exists")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiErrorHandle(400,"Avatar file is required")
    }
    const avatar=await uploadFileCloudinary(avatarLocalPath);
    const coverImage= await uploadFileCloudinary(coverImageLocalPath);
    console.log(req.files)

    if(!avatar){
        throw new ApiErrorHandle(400,"Avatar file is required")
    }
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    if (!user._id) {
        throw new ApiErrorHandle(400, "User ID is required");
      }
      console.log("user._id:", user._id);
console.log("email:", email);
console.log("username:", username);

      
      const createdUser = await User.findById(user._id).select("-password -refreshToken");
   if(!createdUser){
    throw new ApiErrorHandle(500,"Something went wrong while registering ")


   }
   return res.status(201).json(
    new ApiResponse(201,createdUser,"User registered Successfully")
   )
   

  });
  
  export {registerUser}