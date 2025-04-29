import { Router } from "express";

import { registerUser ,logoutuser} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"

import { verfiyjwt } from "../middlewares/auth.middlewares.js";


const router=Router()


router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)


//secured roites

router.route("/logout").post(verfiyjwt,logoutuser)

export default router