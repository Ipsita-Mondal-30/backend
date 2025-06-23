import { Router} from "express";
import { registerUser } from "../controllers/users.controllers.js";
import {upload} from "../utils/multer.js";

const userRouter = Router();

userRouter.post("/register",
    upload.field([
        {
            name:"avatar",
            maxCount:1


        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser);


export default userRouter;