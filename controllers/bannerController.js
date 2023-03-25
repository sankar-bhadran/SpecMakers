const Banner=require('../models/BannersModel');

const loadbanner=async(req,res)=>{
    try {
        const bannerdata=await Banner.find()
        res.render('Banner',{banners:bannerdata})
    } catch (error) {
        console.log(error.message)
    }
}

const uploadbanner=async(req,res)=>{
    try {
        res.render('uploadbanner')
    } catch (error) {
        console.log(error.message)
    }
}

const addbanner=async(req,res)=>{
    try {
        const banner=new Banner({
            banner:req.body.bName,
            bannerImage:req.files.map((x)=>x.filename),
            description:req.body.bDescription 
        });
        const bannerdata=await banner.save()
        if(bannerdata){
            res.render('uploadbanner',{message:'BANNER UPLOADED'})
        }else{
            res.render('uploadbanner',{message:'BANNER NOT UPLOANDED'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const currentbanner=async(req,res)=>{
    try {
        const id=req.query.id;
        console.log(id);
        const bannerdata=await Banner.findOne({_id:id})
        if(bannerdata.is_active == 0){
            await Banner.findByIdAndUpdate({_id:id},{$set:{is_active:1}});
            console.log(90000);
        }else{
            await Banner.findByIdAndUpdate({_id:id},{$set:{is_active:0}});
        }
        res.redirect('/admin/loadbanner');
    } catch (error) {
        console.log(error.message)
    }
}

const editbanner=async(req,res)=>{
    try {
        const id =req.query.id
        const bannerdata=await Banner.findOne({_id:id})
    } catch (error) {
        console.log()
    }
}

module.exports={
    loadbanner,
    addbanner,
    uploadbanner, 
    currentbanner,
}