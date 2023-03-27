const User=require('../models/userModel');
const Category=require('../models/categoryModel');
const Product=require('../models/productModel');
const Order=require('../models/orderModel');
const bcrypt=require('bcrypt')


const path=require('path')  
const multer=require('multer');
const { ObjectID, ObjectId } = require('bson');
let Storage = multer.diskStorage({
  destination:"./public/admin/assets/uploads/",
  filename:(req,file,cb)=>{
      cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
  }
})
let upload = multer({
  storage:Storage,fileFilter: function (params, file, callback) {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg") {
      callback(null, true)
    } else {
      console.log('only jpg & png file supported !');
      callback(null, false)
}
}
})

Ordertype='all'

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("login", { message: "email and password incorrect" });
        } else {
          req.session.admin_id = userData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("login", { message: "email and password is incorrect" });
      }
    } else {
      res.render("login", { message: "email and password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadDashboard = async (req,res) => {
  try {
    console.log(10000);
    const products=await Product.find({isAvailable:1})
    // console.log(products);
    let product=[],qty=[]
    products.map(x=>{
      product=[...product,x.name]
      console.log(product);
      qty=[...qty,x.quantity]
    })
    const arr = [];
    const order = await Order.find().populate('products.item.productId');    
    for (let orders of order) {
      for (let product of orders.products.item) {
        const index = arr.findIndex(obj => obj.product == product.productId.name);
        if (index !== -1) {
          arr[index].qty += product.qty;
        } else {
          arr.push({ product: product.productId.name, qty: product.qty });
        }
      }
    }
    const key1 = [];
    const key2 = [];
    arr.forEach(obj => {
      key1.push(obj.product);
      key2.push(obj.qty);
    });

    const userData = await User.findById({ _id: req.session.admin_id });
    res.render("home",{admin:userData,product,qty,key1,key2});
  } catch (error) {
    console.log(error.message);
  }
};


const viewuser=async(req,res)=>{
  try {
    const userData=await User.find({is_admin:0});
    res.render('adminuser',{users:userData});
  } catch (error) {
    console.log(error.message)
  }
};

const blockuser=async(req,res)=>{
  try {
    const id=req.query.id;
    const userData=await User.findById({_id:id})
    if(userData.isVerified){
      await User.findByIdAndUpdate({_id:id},{$set:{isVerified: 0 }});
    }
    else{
      await User.findByIdAndUpdate({_id:id},{$set:{isVerified: 1 }})
    }
    res.redirect('/admin/view-user')
  } catch(error){
      console.log(error.message);
  }
};

const viewCategory=async(req,res)=>{
  try {
    const categoryData=await Category.find({isAvailable:1});
    // console.log(categoryData);
    res.render('admin-category',{category:categoryData})

  } catch (error) {
    console.log(error.message)
  }
};

const deleteCategory=async (req,res) =>{
  try {
    const id=req.query.id;
    const categoryData= await Category.deleteOne({_id:id});
    res.redirect('admin-category');    

  } catch (error) {
    console.log(error.message);
  }
}

const addCategory = async (req, res) => {
  const categoryData = await Category.findOne( { name: req.body.category})
  const categoryAll =await Category.find({isAvailable:1})
  if(categoryData){
    res.render('admin-category', { category:categoryAll, message: 'category already Exists'})
  } else{
    try {
      const category = Category({
        name: req.body.category,
      });
      const categoryData = await category.save();
      res.redirect("admin-category");
    } catch (error) {
      console.log(error);
    }
  }
};


const  addProductLoad= async(req,res)=>{
  try {
    const categoryData=await Category.find()
    res.render("add-product",{ category: categoryData})
  } catch (error) {
    console.log(error.message)
  }
}

const updateAddProduct= async(req,res)=>{
  try {
    const categoryData= await Category.find();
    const product=Product({
      name:req.body.gName,
      quantity:req.body.gQuantity,
      price:req.body.gPrice,
      description:req.body.gDescription,
      rating:req.body.gRating,
      genre:req.body.genre,
      image:req.files.map((x)=>x.filename),
    });
    const productData=await product.save()
    if(productData){
      res.render("add-product",{
        message:"Registration Successful",
        category:categoryData,
    });
    }else{
      res.render("add-product",{message:"Registration failed"})
    }
  } catch (error) {
    console.log(error.message);
  }
};


const viewProduct=async(req,res)=>{
  try {
    const productData=await Product.find()
    res.render('adminProduct',{products:productData})
  } catch (error) {
    console.log(error.message)
  }
}


const editProduct=async(req,res)=>{
  try {
    const id=req.query.id;
    console.log(id);
    const productData= await Product.findById({_id:id});
    if(productData){
      res.render("edit-product",{product:productData});
    }
    else{
      res.redirect("/admin/view-product");
    }
  } catch (error) {
    console.log(error.message);
  }
}

const updateEditProduct=async(req,res)=>{
  try { 
      const id =req.query.id
      console.log(1001);
      console.log(id);
      console.log(req.body.id);
    const productDetails = await Product.findOne({_id:req.body.id })
    console.log(productDetails);
    console.log(1002);
        const oldImg = productDetails.image
        const newImg = req.files.map((x) => x.filename)
        const images = oldImg.concat(newImg)
        // console.log(oldImg,newImg,images);
    const productData= await Product.findByIdAndUpdate(
      {_id:req.body.id},
      {
        $set:{
          name:req.body.gName,
          quantity:req.body.gQuantity,
          price:req.body.gPrice,
          description:req.body.gDescription,
          rating:req.body.gRating,
          genre:req.body.genre,
          image:images
        },
      }
    );
    console.log("productdata==="+productData);
    res.redirect("/admin/view-product");
  } catch (error) {
    console.log(error.message);
  }
};


const deletesingleimage=async(req,res)=>{
  try {
    let{itemId,imageName}=req.body
    console.log(itemId,imageName);

    const productData=await Product.updateOne({_id:itemId},{$pull:{image:imageName}},{upsert:true})
    console.log(productData);
    res.json({success:true});
  } catch (error) {
    console.log(error.message)
  }
}

const deleteProduct=async(req,res)=>{
  try {
    const id=req.query.id;
    const productData=await Product.updateOne(
      {_id:id},
      {$set:{isAvailable:0}}
    );
    res.redirect("/admin/view-product");
  } catch (error) {
    console.log(error.message)
  }
}


const adminorders=async(req,res)=>{
  try {
    const productData=await Product.find()
    const admindata=await User.find({is_admin:0})
    const orderData=await Order.find().sort({OrderedAt:-1});
    for(let key of orderData){
      await key.populate('products.item.productId');
      await key.populate('userId')
    }
    console.log(orderData);
    if(Ordertype == undefined){
      res.render('adminorders',{admin:admindata,product:productData,order:orderData})

    }else{
      id=req.query.id
      res.render('adminorders',{admin:admindata,product:productData,order:orderData,id:id})
    }
    
  } catch (error) {
    console.log(error.message)
  }
}

const updateOrderStatus=async(req,res)=>{
  try {
    const orderId=req.body.orderid
    const updatestatus=await Order.findByIdAndUpdate({_id:ObjectId(orderId)},{$set:{status:req.body.status}})
    res.redirect('/admin/adminorders')
  } catch (error) {
    console.log(error.message)
  }
}


const vieworderdetails=async(req,res)=>{
  try {
    const id=req.query.id
    const orderdata=await Order.findById({_id:id}).populate('products.item.productId')
    console.log(orderdata);
    // await orderdata.
    const addressId=await orderdata.populate('addressId')
    console.log(addressId);
    res.render('adminorderdetails',{orderdetails:orderdata,addressdata:addressId})
  } catch (error) {
    console.log(error.message)
  }
}


const salesreport=async(req,res)=>{
  try {
    const orderdata=await Order.find().sort({OrderedAt:-1}).populate('userId').populate('products.item.productId')
    res.render('salesreport',{orders:orderdata})
  } catch (error) {
    console.log(error.message)
  }
}

const downloadreport=async(req,res)=>{
  try {
    let{sdate,edate}=req.body
    console.log(100);
    console.log(req.body);
    console.log(sdate,edate);
    const salesreport=await Order.find({OrderedAt:{$gte:sdate,$lte:edate}}).populate('userId')
    console.log(salesreport);
    res.send({ordersdata:salesreport})
  } catch (error) {
    console.log(error.message)
  }
}


// const cancelOrderStatus=async(req,res)=>{
//   try {
//     const id=req.query.id
//     await Order.findByIdAndUpdate({_id:id},{$set:{'status':'Cancelled'}})
//     res.redirect('/admin/adminorders')
//   } catch (error) {
//     console.log(error.message)
//   }
// }

// const deliverOrderStatus=async(req,res)=>{
//  try {
//   const id=req.query.id
//   await Order.findByIdAndUpdate({_id:id},{$set:{'status':'Delivered'}})
//   res.redirect('/admin/adminorders')
//  } catch (error) {
//   console.log(error.message)
//  }
// }

// const confirmOrderStatus=async(req,res)=>{
//   try {
//     const id=req.query.id
//     await Order.findByIdAndUpdate({_id:id},{$set:{'status':'Comfirmed'}})
//     res.redirect('admin/adminorders')
//   } catch (error) {
//     console.log(error.message)
//   }
// }

const logout = async (req, res) => {
  try {
    req.session.admin_id = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};


module.exports={
  loadLogin,
  verifyLogin,
  loadDashboard, 
  viewuser,
  blockuser,
  viewCategory,
  addCategory,
  deleteCategory,
  viewProduct,
  addProductLoad,
  updateAddProduct,
  upload,
  editProduct,
  updateEditProduct,
  deleteProduct,
  adminorders,
  updateOrderStatus,
  deletesingleimage,
  // cancelOrderStatus,
  // deliverOrderStatus,
  // confirmOrderStatus,
  vieworderdetails,
  salesreport,
  downloadreport,
  logout,
}



























