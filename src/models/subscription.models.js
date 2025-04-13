import mongoose,{Schema} from "mongoose"


const subcriptionSchema=new Schema({
    
    
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },

},
{timestamps:true}
)

export const subcription=mongoose.model("Subscription",subcriptionSchema)