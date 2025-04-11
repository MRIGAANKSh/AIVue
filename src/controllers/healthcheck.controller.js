import {ApiResponse} from "../utils/apiresponse.js"
import { asynchandler } from "../utils/asynchandler.js"


const healthcheck= asynchandler(async(req,res)=>{

    return res
    .status(200)
    .json(new ApiResponse(200,"ok","health check passed"))
})
    
export {healthcheck}