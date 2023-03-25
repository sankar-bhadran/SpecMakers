const User=require('../models/userModel');
const Product=require('../models/productModel');


const Wishlist=async(req,res)=>{
    try {
        if(req.session.user1){check=true} else check=false
        userSession=req.session
        if(userSession.user_id){
            const userData=await User.findById({_id:userSession.user_id})
            const completeUser=await userData.populate('wishlist.item.productId')
            res.render('wishlist',{user:check,id:userSession.user_id,Wishlistproducts:completeUser.wishlist})

        }else{
          res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message)
    }
}

const addtowishlist=async(req,res)=>{
     try {
        let{wishlistid}=req.body
        userSession=req.session
        if(userSession.user_id){
        const userData=await User.findById({_id:userSession.user_id})
        const productData=await Product.findById({_id:wishlistid})
        userData.addtowishlist(productData)
        res.redirect('/wishlist');
        }else{
            res.redirect('/login');
        }
     } catch (error) {
        console.log(error.message)
     }
}

const deletewishlist=async(req,res)=>{
    try {
        const ProductId=req.query.id;
        userSession=req.session
        const userData=await User.findById({_id:userSession.user_id})
        userData.removewishlist(ProductId)
        res.redirect('/wishlist')
    } catch (error) {
        console.log(error.message)
    }
}


module.exports={
    Wishlist,
    addtowishlist,
    deletewishlist,
}