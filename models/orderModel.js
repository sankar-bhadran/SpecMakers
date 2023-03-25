const mongoose=require('mongoose')
const orderSchema =new mongoose.Schema({
     userId:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        required:true,
     },
     
     payment:{
        type:String,
        required:true,
     },
     
     addressId:{
        type:mongoose.Types.ObjectId,
        ref:'Address',
        required:true
     },

     OrderedAt:{
        type:Date,
        immutable:true,
        default:()=>Date.now()
     },

     products:{
        item:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'product'
            },

            qty:{
                type:Number,
                required:true,
            },

            price:{
                type:Number,
                required:true
            },
        }],
        totalPrice:{
            type:Number,
            default:0
        }
     },
     
     status:{
        type:String,
        default:"In process"
     },

});

module.exports= mongoose.model('orders',orderSchema);




