const mongoose=require("mongoose");
const Product=require("../models/productModel")
const userSchema=new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    password2:{
        type:String,
    },
    is_admin:{
        type:Number,
        required:true
    },
    isVerified:{
        type:Number,
        default:1   
    },
    
    cart:{
        item:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:"product",
                required:true
            },

            qty:{
                type:Number,
                required:true
            },

            price:{
                type:Number
            },
        }],
        totalPrice:{
            type:Number,
            default:0
        }
    },
    
    wishlist:{
        item:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'product',
                required:true
            },
        }],
    },

});

userSchema.methods.addToCart = function (product) {
    const cart = this.cart
    const isExisting = cart.item.findIndex(objInItems => {
        return new String(objInItems.productId).trim() == new String(product._id).trim()
    })
    if(isExisting >=0){
        cart.item[isExisting].qty +=1
    }else{
        cart.item.push({productId:product._id,qty:1,price:product.price})
    }
    cart.totalPrice += product.price
    console.log(typeof (product.price));
    console.log("User in schema:",this);
    return this.save()
}

userSchema.methods.removefromCart=async function(productId){
    const cart=this.cart
    const isExisting=cart.item.findIndex(objInItems=> new String(objInItems.productId).trim()===new String(productId).trim())
    if(isExisting >=0){
        const prod=await Product.findById(productId)
        cart.totalPrice -= prod.price*cart.item[isExisting].qty
        cart.item.splice(isExisting,1)
        console.log("User in schema:".this);
        return this.save()
    }
}


userSchema.methods.addtowishlist= function(product){
    const wishlist=this.wishlist;
    const isExisting= wishlist.item.findIndex(objInItems =>{
        return new String(objInItems.productId).trim() == new String(product._id).trim()
    })

    if(isExisting>=0){

    }else{
        wishlist.item.push({
         productId:product._id,
        })
    }
    return this.save()
}


userSchema.methods.removewishlist= async function(productid){
    const wishlist=this.wishlist;
    const isExisting=wishlist.item.findIndex(objInItems=>{
        return new String(objInItems.productId).trim() === new String(productid) .trim()
    })

    if(isExisting>=0){
        const product=await Product.findById(productid)
        wishlist.item.splice(isExisting,1)
        return this.save()
    }
    

}

userSchema.methods.updatecart= async function(id,qty){
    const cart=this.cart;
    const product=await Product.findById({_id:id})
    const index=cart.item.findIndex(objInItems=>{
        return new String(objInItems.productId).trim() == new String(product._id).trim()
    });
    if(qty>cart.item[index].qty){
        cart.item[index].qty +=1
        cart.totalPrice += product.price
    }else{
        cart.item[index].qty -=1;
        cart.totalPrice -= product.price
    }   
    this.save()
    return cart.totalPrice

}





module.exports=mongoose.model("user",userSchema )