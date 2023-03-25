const mongoose=require('mongoose')

const couponSchema=new mongoose.Schema({
    Couponname:{
        type:String,
        required:true
    },

    discount:{
        type:Number,
        required:true
    },

    min_value:{
        type:Number,
        required:true
    },

    max_discount:{
        type:Number,
        required:true
    },

    description:{
        type:String,
        required:true
    },

    expiry_Data:{
        type:Date,
        required:true
    },


})

module.exports=mongoose.model('coupon',couponSchema);