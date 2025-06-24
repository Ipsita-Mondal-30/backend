import { asyncHandler } from "../utils/asynchandler.js";   
import { ApiErrorHandle } from "../utils/ApiErrorHandle.js";
import{ User } from "../models/users.models.js";
import { uploadFileCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    }
    catch(err){
        throw new ApiErrorHandle(500,"Something went wrong while generating refresh and access token")
    }
}
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

    const fullName = req.body.fullName?.trim();
const email = req.body.email?.trim();
const username = req.body.username?.trim();
const password = req.body["password "]?.trim();
    console.log("email",email);
    console.log("username",username);
    console.log("password",password);
    console.log("fullName",fullName);

    if([fullName,email,password,username].some((field)=> field?.trim() === "" )){
        throw new ApiErrorHandle(400,"All fields are required")
    }

    if (!email || !username) {
        throw new ApiErrorHandle(400, "Email and Username are required");
      }
      
      const existedUser = await User.findOne({
        $or: [{ email }, { username }]
      });
      console.log("BODY:", req.body);
      
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
const loginUser= asyncHandler(async(req,res)=>{
    //req body-email,password
    //check validation
    //check user exists
    //check password
    //send cookies

     const {email,username,password}=req.body
     if(!(username || email)){
        throw new ApiErrorHandle(400,"username or email is required")
     }
     const foundUser=await User.findOne({
        $or:[{username},{email}]
     })

     if(!foundUser){
        throw new ApiErrorHandle(404,"user does not exists")
     }
     const isPasswordValid = await foundUser.isPasswordCorrect(password);

     if(!isPasswordValid){
        throw new ApiErrorHandle(400,"password is not valid")
     }
   const {accessToken,refreshToken}= await  generateAccessAndRefreshToken(foundUser._id)

   const loggedInUser=await User.findById(foundUser._id).select("-password -refreshToken")

   const options={
    httpsOnly:true,
    secure:true,
   }
   return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
    new ApiResponse(200,{
        accessToken,
        refreshToken,
        user:loggedInUser
    },"User LoggedIn Successfully")
   )
})
const logoutUser=asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
        }
    },
    {
        new:true
    }
   )
   const options =
   {
    httpsOnly:true,
    secure:true,
   }
   return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
    new ApiResponse(200,{},"User LoggedOut Successfully")
   )
   
})
 
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiErrorHandle(401,"Unauthorized Request")
    }
   try {
     const decodeToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user=await User.findById(decodeToken._id)
     if(!user){
         throw new ApiErrorHandle(404,"Invalid Request")
     }
     if(incomingRefreshToken !== user.refreshToken){
         throw new ApiErrorHandle(400,"Refresh Token is Invalid")
     }
     const accessToken=await generateAccessAndRefreshToken(user._id)
     const options={
         httpsOnly:true,
         secure:true,
        }
        return res.status(200).cookie("accessToken",accessToken,options).json(
         new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token Refreshed")
        )
   } catch (error) {
    throw new ApiErrorHandle(401,error?.message || "Invalid Refresh Token")
   }

  
})
const currentPasswordchange=asyncHandler(async()=>{

    const {oldPassword,newPassword}= req.body
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=  await user.isPasswordCorrect(oldPassword)

    if(!oldPassword){
        throw new ApiErrorHandle(400,"Invalid old password")

    }
    user.password=newPassword
    user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200, {}, "Password changed"))

})

  
  export {registerUser,loginUser,logoutUser,refreshAccessToken,currentPasswordchange}