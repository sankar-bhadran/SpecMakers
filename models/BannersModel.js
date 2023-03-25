const mongoose=require('mongoose')

const BannerSchema=new mongoose.Schema({

  banner:{
    type:String,
    required:true
  },

  bannerImage:{
    type:Array,
    required:true
  },

  description:{
    type:String,
    required:true
},

  is_active:{
    type:Number,
    default:0
  }

});

module.exports=mongoose.model('Banner',BannerSchema)