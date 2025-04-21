import { v2 as cloudinary } from 'cloudinary';

import fs from "fs"

//CONFIG 
// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary=async (localfilePath)=>{

try{
if(!localfilePath){
    return null;
}
const response=await cloudinary.uploader.upload(
    localfilePath,{
        resource_type:"auto"
    }
)
console.log("file uplaoded "+response.url)
//file uplaoded it will delete from server.
fs.unlinkSync(localfilePath)
return response;
}

catch(error){
    fs.unlinkSync(localfilePath)
    return null;
}

}

export {uploadOnCloudinary};