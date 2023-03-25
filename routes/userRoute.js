const express=require("express");
const user_route=express()
const session=require("express-session")
const nocache = require("nocache");

user_route.set("view engine","ejs");
user_route.set("views","./views/user")

user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}))

const config=require("../config/config")

user_route.use(
    session({
      secret: config.sessionsecret,
      resave: false,
      saveUninitialized: true,
    })
  );

  user_route.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
  });
user_route.use(nocache())
const userController=require("../controllers/userController");
const usermiddelware=require("../middelware/usermiddelware");
const wishlistController=require('../controllers/wishlistController');



user_route.post('/verifyotp',userController.verifyotp)



user_route.get("/register",usermiddelware.isLogout,userController.loadRegister);
user_route.post("/register",userController.loadOTP);

user_route.get('/',userController.loadhome);
user_route.get('/home',userController.loadhome);

user_route.get('/login',usermiddelware.isLogout,userController.loginLoad);
user_route.post('/login',userController.verifyLogin);
user_route.get('/loadchangepassword',userController.loadchangepassword);
user_route.post('/changepassword',userController.changepasssword);
user_route.get('/loadforgotpassword',userController.forgotpassword);
user_route.post('/loadforgotpassword',userController.forgotverifyno);
user_route.post('/forgotverifyotp',userController.forgotverifyotp);
user_route.post('/forgotchangepassword',userController.resetpassword)

user_route.get('/shop',userController.loadshop);
user_route.post('/updateshop',userController.updateshop);
user_route.get('/viewproduct',userController.viewProductPage);
user_route.get('/view-product',usermiddelware.isLogin,userController.viewRelatedpage);

user_route.get('/cart',usermiddelware.isLogin,userController.loadcart);
user_route.post("/addtocart",usermiddelware.isLogin,userController.addToCart);
user_route.post('/editCart',usermiddelware.isLogin,userController.editCart);
user_route.get('/deletecart',usermiddelware.isLogin,userController.deleteCart);

user_route.get('/dashboard',userController.userdashboard)
user_route.get('/orderdetails',usermiddelware.isLogin,userController.Ordersdetails)
user_route.post('/addaddress',usermiddelware.isLogin,userController.addaddress);
user_route.get('/edituser',usermiddelware.isLogin,usermiddelware.isLogin,userController.edituser);
user_route.post('/edituser',usermiddelware.isLogin,userController.updateuser);
user_route.post('/updatecart',usermiddelware.isLogin,userController.updatecart);

user_route.get('/vieworder',usermiddelware.isLogin,userController.vieworderdetails);
user_route.post('/checkoutaddress',usermiddelware.isLogin,userController.checkoutaddress);
user_route.get('/deleteaddress',usermiddelware.isLogin,userController.deleteaddress);

user_route.get('/checkout',usermiddelware.isLogin,userController.checkout);
user_route.post('/checkout',usermiddelware.isLogin,userController.placeorders);
user_route.get('/ordersuccess',usermiddelware.isLogin,userController.orderSuccess)
user_route.get('/cancelorder',usermiddelware.isLogin,userController.cancelOrders);
user_route.get('/returnorder',usermiddelware.isLogin,userController.returnOrders);

user_route.get('/editaddress',usermiddelware.isLogin,userController.editadderss);
user_route.post('/editaddress',usermiddelware.isLogin,userController.updateaddress);

user_route.get('/editaddresscheckout',usermiddelware.isLogin,userController.editaddersscheckout);
user_route.post('/editaddresscheckout',usermiddelware.isLogin,userController.updateaddresscheckout);
user_route.get('/deletaddresscheckout',usermiddelware.isLogin,userController.deleteaddresscheckout);

user_route.get('/wishlist',wishlistController.Wishlist);
user_route.post('/addtowishlist',usermiddelware.isLogin,wishlistController.addtowishlist);

user_route.get('/deletewishlist',usermiddelware.isLogin,wishlistController.deletewishlist);

user_route.post('/applycoupon',userController.applycoupon);

user_route.get('/razorPay',userController.razorPay)

user_route.get('/logout',usermiddelware.isLogin,userController.userLogout)




module.exports=user_route;