import mongoose,{Schema} from "mongoose"

const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,

        },
        fullname:{
            type:String,
            required:true,
            index:true,
            trim:true,
        },
        avatar:{
            type:String,
            required:true
        },
        coverimage:{
            type:String,
        },
        watchhistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true,"password must be there"]
        },
        refreshToken:{
            type:String,
        }

        
    },
    {timestamps:true}
)

export const User=mongoose.model("User",userSchema)