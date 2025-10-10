import mongoose from "mongoose";
const myusersschema=mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    clicked:{
        type:Boolean,
        default:false,
    },
    purchased:{
        type:Boolean,
        default:false
    },
})
const myusers=mongoose.model('myusers',myusersschema)
export default myusers