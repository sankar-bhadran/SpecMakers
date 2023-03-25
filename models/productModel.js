const mongoose=require('mongoose')

const productSchema= new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    quantity:{
        type:String,
        required:true
    },

    genre:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },

    price:{
        type:Number,
        required:true
    },

    rating:{
        type:Number,
        required:true
    },

    image:{
        type:Array
    },

    isAvailable:{
        type:Number,
        default:1   
    }

    
});


module.exports=mongoose.model('product',productSchema)