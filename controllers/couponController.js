const Coupon=require('../models/couponModel');

const loadcoupon=async(req,res)=>{
    try {
        const coupondata=await Coupon.find()
        res.render('adminoffer',{coupon:coupondata})
    } catch (error) {
        console.log(error.message)
    }
}

const uploadcoupon=async(req,res)=>{
    try {
        res.render('uploadcoupon')
    } catch (error) {
        console.log(error.message)
    }
}

const addcoupon=async(req,res)=>{
    try {
        const coupon=new Coupon({
         Couponname:req.body.couponName,
         description:req.body.description,
         discount:req.body.discount,
         min_value:req.body.minvalue,
         max_discount:req.body.maxdiscount,
         expiry_Data:req.body.expirydate,

        })
        const addcoupon=await coupon.save()
        console.log(coupon);
        if(addcoupon){
            res.render('uploadcoupon',{message:'Coupon Uploaded'})
        }else{
            res.render('uploadcoupon',{message:'Coupon Not Uploaded'})
        }
    } catch (error) {
        console.log(error.message)
    }
}


module.exports={
    loadcoupon,
    uploadcoupon,
    addcoupon,

}