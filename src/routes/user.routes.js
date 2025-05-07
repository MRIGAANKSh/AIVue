import { Router } from "express";

import { registerUser ,logoutuser,loginuser, refreshAcessToken, changeCureentPassword, getCurrentuser, getUserChannelProfile, updateAccountDetails, updateUserAvatarImage, updateUserCoverImage, getWatchHistroy} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"

import { verfiyjwt } from "../middlewares/auth.middlewares.js";


const router=Router()

//unsecured roites
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

router.route("/login").post(loginuser)
router.route("/refresh-token").post(refreshAcessToken)

//secured routes
router.route("/change-password").post(verfiyjwt,changeCureentPassword)
router.route("/current-user").get(verfiyjwt,getCurrentuser)
router.route ("/c/:username").get(verfiyjwt,getUserChannelProfile)
router.route("/update-account").patch(verfiyjwt,updateAccountDetails)
router.route("/avatar").patch(verfiyjwt, upload.single("avatar"),updateUserAvatarImage)
router.route("/cover-image").patch(verfiyjwt,upload.single("coverImage"),updateUserCoverImage)
router.route("/history").get(verfiyjwt,getWatchHistroy)



router.route("/logout").post(verfiyjwt,logoutuser)



export default router