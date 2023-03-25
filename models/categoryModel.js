const mongoose=require('mongoose')

const categorySchema=new mongoose.Schema({

    name:{
        type:String,
        unique:true,
        uppercase:true,
        required:true
    },

    isAvailable:{
        type:Number,
        default:1
    },
})

module.exports=mongoose.model('Category',categorySchema)