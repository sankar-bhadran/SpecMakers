const express=require('express');
const admin_route=express();
const config=require('../config/config');
const admincontroller=require('../controllers/adminController');
const adminmiddelware=require('../middelware/adminmiddelware');
const bannercontroller=require('../controllers/bannerController');
const couponcontroller=require('../controllers/couponController');
const multers=require('../bannermulter/multer')


const session=require('express-session');
const multer = require('multer');
admin_route.use(session({ 
  secret: config.sessionSecret,
  resave:false,
  saveUninitialized:true,    
}));

admin_route.use(function(req, res, next) {
  if (!req.user)
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});

admin_route.use(express.json());
admin_route.use(express.urlencoded({extended:true}))
 
admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin')


admin_route.get('/',adminmiddelware.isLogout,admincontroller.loadLogin);
admin_route.post('/',admincontroller.verifyLogin);
admin_route.get('/home',adminmiddelware.isLogin,admincontroller.loadDashboard);

admin_route.get('/view-user',admincontroller.viewuser);
admin_route.get('/adminuser',adminmiddelware.isLogin,admincontroller.viewuser);
admin_route.get('/block-user',adminmiddelware.isLogin,admincontroller.blockuser)

admin_route.get('/view-product',adminmiddelware.isLogin,admincontroller.viewProduct)
admin_route.get('/admin-category',adminmiddelware.isLogin,admincontroller.viewCategory);
admin_route.post('/admin-category',adminmiddelware.isLogin,admincontroller.addCategory);
admin_route.get('/delete-category',adminmiddelware.isLogin,admincontroller.deleteCategory);

admin_route.get('/adminProduct',adminmiddelware.isLogin,admincontroller.viewProduct);
admin_route.get('/add-product',adminmiddelware.isLogin,admincontroller.addProductLoad)
admin_route.post('/add-product',admincontroller.upload.array("gImage",5), admincontroller.updateAddProduct);
admin_route.get('/edit-product',adminmiddelware.isLogin,admincontroller.editProduct);
admin_route.post('/edit-product',admincontroller.upload.array("gImage",5),admincontroller.updateEditProduct);
admin_route.post('/deletesingleimage',admincontroller.deletesingleimage);
admin_route.get('/delete-product',adminmiddelware.isLogin,admincontroller.deleteProduct);

admin_route.get('/adminorders',adminmiddelware.isLogin,admincontroller.adminorders)
admin_route.post('/adminorders',admincontroller.updateOrderStatus);
// admin_route.get('/admincancelorder',admincontroller.cancelOrderStatus);
// admin_route.get('/admindeliverorder',admincontroller.deliverOrderStatus);
// admin_route.get('/adminconfirmorder',admincontroller.confirmOrderStatus);
admin_route.get('/adminorderdetails',admincontroller.vieworderdetails);
admin_route.get('/salesreport',admincontroller.salesreport)
admin_route.post('/downloadreport',admincontroller.downloadreport)

admin_route.get('/loadbanner',bannercontroller.loadbanner);
admin_route.get('/uploadbanner',bannercontroller.uploadbanner);
admin_route.post('/uploadbanner',multers.upload.array('bannerImage',3),bannercontroller.addbanner);
admin_route.get('/currentbanner',bannercontroller.currentbanner);

admin_route.get('/coupon',couponcontroller.loadcoupon);
admin_route.get('/uploadcoupon',couponcontroller.uploadcoupon);
admin_route.post('/uploadcoupon',couponcontroller.addcoupon);


admin_route.get('/logout',adminmiddelware.isLogin,admincontroller.logout);
admin_route.get('*',function(req,res){
  res.render('home')
})


module.exports=admin_route;