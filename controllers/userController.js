const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Orders = require("../models/orderModel");
const message = require("../config/sms");
const Banner = require("../models/BannersModel");
const Coupon = require("../models/couponModel");
const Category = require("../models/categoryModel");
const RazorPay = require("razorpay");
const { ObjectId } = require("mongodb");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};

let user;
const loadOTP = async (req, res) => {
  const verify = await User.findOne({
    $or: [{ mobile: req.body.mno }, { email: req.body.email }],
  });
  if (verify) {
    console.log(verify + "hdjh");
    res.render("registration", { message: "user already exists!" });
  } else {
    const spassword = await bcrypt.hash(req.body.password, 10);
    user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      password: spassword,
      is_admin: 0,
    });
    newotp = message.sendMessage(req.body.mno, res);
    console.log(newotp);
    res.render("otpverify", { otp: newotp });
  }
};

const verifyotp = async (req, res) => {
  try {
    // (req.body.checkOtp == req.body.otp){
    if ("1234" == req.body.otp) {
      const userData = await user.save();
      if (userData) {
        res.redirect("/login");
      } else {
        res.render("registration", { message: "your registration is failed" });
      }
    } else {
      res.render("registration", { message: "otp failed" });
      console.log("otp is incorrect");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// login methods
const loginLoad = async (req, res) => {
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

    const userData = await User.findOne({ email: email, is_admin: 0 });
    console.log("user:" + userData);
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.isVerified) {
          req.session.user_id = userData._id;
          req.session.user = userData.name;
          req.session.user1 = true;

          res.redirect("/home");
        } else {
          res.render("login", { message: "sorry your blocked" });
        }
      } else {
        res.render("login", { message: "email and password are incorrect" });
      }
    } else {
      res.render("login", { message: "email and password are incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadchangepassword = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    res.render("changepassword", { user: check });
  } catch (error) {
    console.log(error.message);
  }
};

const changepasssword = async (req, res) => {
  try {
    userSession = req.session;
    currentpassword = req.body.currentpass;
    newpassword = req.body.newpass;
    confirmpassword = req.body.confirmpass;
    if (req.session.user1) {
      check = true;
    } else check = false;

    if (userSession.user_id) {
      const userData = await User.findById({ _id: userSession.user_id });
      const passwordvalid = await bcrypt.compare(
        currentpassword,
        userData.password
      );
      if (passwordvalid) {
        if (newpassword == confirmpassword) {
          const hashedpassword = await bcrypt.hash(newpassword, 10);
          userData.password = hashedpassword;
          await userData.save();
          res.render("changepassword", {
            user: check,
            message: "Password updated successfully.",
          });
        } else {
          res.render("changepassword", {
            user: check,
            message: "New password and confirm password do not match.",
          });
        }
      } else {
        res.render("changepassword", {
          user: check,
          message: "Current password is incorrect.",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgotpassword = async (req, res) => {
  try {
    res.render("forgotpassword");
  } catch (error) {
    console.log(error.message);
  }
};

const forgotverifyno = async (req, res) => {
  try {
    const No = req.body.number;
    const verify = await User.findOne({ mobile: No });
    if (verify) {
      newotp = message.sendMessage(No, res);

      console.log(newotp);
      res.render("forgotpasswordotp", { otp: newotp, mobile: No });
    } else {
      res.render("forgotpassword", { message: "User Not Exist" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgotverifyotp = async (req, res) => {
  try {
    const No = req.body.number;
    if (req.body.otp == req.body.checkOtp) {
      res.render("forgotchangepassword", { mobile: No });
    } else {
      res.render("forgotpasswordotp", { message: "Wrong OTP", otp: newotp });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetpassword = async (req, res) => {
  try {
    const number = req.body.number;
    const newpassword = req.body.password;
    const confirmpassword = req.body.confirmPassword;
    const securePassword = await bcrypt.hash(confirmpassword, 10);
    const updatedata = await User.updateOne(
      { mobile: number },
      { $set: { password: securePassword } }
    );
    if (updatedata) {
      res.render("login", { message: "Password Update Successfully" });
    } else {
      res.render("login", { message: "Verification Failed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadhome = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    const productData = await Product.find({ isAvailable: 1 });
    console.log(productData);
    const banner = await Banner.find({ is_active: 1 });
    res.render("home", { user: check, products: productData, banners: banner });
  } catch (error) {}
};

const loadshop = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    const productData = await Product.find({ isAvailable: 1 });
    const categorydata = await Category.find({ isAvailable: 1 });
    res.render("shop", {
      products: productData,
      user: check,
      category: categorydata,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const updateshop = async (req, res) => {
  try {
    let categoryfilter = req.body.category;
    if (req.body.category) {
      categoryfilter = req.body.category;
    } else {
      categoryfilter = [];
    }
    console.log(categoryfilter);
    let price = req.body.sortedvalue;
    console.log(price);
    const productData = await Product.find({ isAvailable: 1 });
    let productdata;
    if (req.session.user1) {
      check = true;
    } else check = false;
    user = check;
    if (categoryfilter.length === 0) {
      productdata = productData;
    } else {
      productdata = await Product.find({ genre: { $in: categoryfilter } });
    }
    if (price === "High") {
      productdata = await Product.find().sort({ price: -1 });
    } else if (price === "Low") {
      productdata = await Product.find().sort({ price: 1 });
    } else if (price === "lastest arrivals") {
      productdata = await Product.find().sort({ $natural: -1 });
    }

    if (price === "High" && req.body.category) {
      productdata = await Product.find({ genre: { $in: categoryfilter } }).sort(
        { price: -1 }
      );
    } else if (price === "Low" && req.body.category) {
      productdata = await Product.find({ genre: { $in: categoryfilter } }).sort(
        { price: 1 }
      );
    } else if (price === "lastest arrivals" && req.body.category) {
      productdata = await Product.find({ genre: { $in: categoryfilter } }).sort(
        { $natural: -1 }
      );
    }

    if (productdata) {
      res.json({ products: productdata, user });
    } else {
      res.render("shop", { products: productdata });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const viewProductPage = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    const id = req.query.id;
    const productData = await Product.findOne({ _id: id });
    const productdetails = await Product.find({ isAvailable: 1 });
    res.render("productDetails", {
      products: productData,
      user: check,
      productone: productdetails,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const viewRelatedpage = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    const id = req.query.id;
    const productdetails = await Product.findOne({ _id: id });
    res.render("productrelated", { productone: productdetails, user: check });
  } catch (error) {
    console.log(error.message);
  }
};

const loadcart = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    userSession = req.session;
    if (userSession.user_id) {
      const userData = await User.findById({ _id: userSession.user_id });
      const completeUser = await userData.populate("cart.item.productId");
      res.render("cart", {
        user: check,
        id: userSession.user_id,
        cartProducts: completeUser.cart,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addToCart = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    let { cartid } = req.body;
    console.log("cartid==" + cartid);
    userSession = req.session;
    if (userSession.user_id) {
      const userData = await User.findById({ _id: userSession.user_id });
      const productdata = await Product.findById({ _id: cartid });
      userData.addToCart(productdata);

      res.json({ success: true, message: "product added to cart" });
    } else {
      // res.redirect('/login')
      res.json({
        success: false,
        message: "please login to add product to cart",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editCart = async (req, res) => {
  try {
    const id = req.query.id;
    userSession = req.session;
    const userData = await User.findById({ _id: userSession.user_id });
    const foundProduct = userData.cart.item.findIndex(
      (objInItems) => objInItems._id == id
    );
    userData.cart.item[foundProduct].qty = req.body.qty;
    userData.cart.totalPrice = 0;
    const totalPrice = userData.cart.item.reduce((acc, curr) => {
      return acc + curr.price * curr.qty;
    }, 0);

    userData.cart.totalPrice = totalPrice;
    await userData.save();
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

const updatecart = async (req, res) => {
  try {
    userSession = req.session;
    let { quantity, _id } = req.body;
    const userData = await User.findById({ _id: userSession.user_id });
    const total = await userData.updatecart(_id, quantity);
    res.json({ total });
  } catch (error) {
    console.log(error.message);
  }
};

const userdashboard = async (req, res) => {
  try {
    userSession = req.session;
    if (userSession.user_id) {
      if (req.session.user1) {
        check = true;
      } else check = false;
      const userData = await User.findById({ _id: userSession.user_id });
      const addressData = await Address.find({ userId: userSession.user_id });
      const orderData = await Orders.find({ userId: userSession.user_id }).sort(
        { OrderedAt: -1 }
      );
      res.render("dashboard", {
        user: check,
        useraddress: addressData,
        user: userData,
        userorders: orderData,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const Ordersdetails = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    res.render("orderdetails", { user: check });
  } catch (error) {
    console.log(error.message);
  }
};

const addaddress = async (req, res) => {
  try {
    userSession = req.session;
    const addressData = Address({
      userId: userSession.user_id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      mobile: req.body.mno,
    });
    await addressData.save();
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const checkoutaddress = async (req, res) => {
  try {
    userSession = req.session;
    const addressData = Address({
      userId: userSession.user_id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      mobile: req.body.mno,
    });

    await addressData.save();
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteaddress = async (req, res) => {
  try {
    userSession = req.session;
    id = req.query.deleteid;
    await Address.findByIdAndDelete({ _id: id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const edituser = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    res.render("edituser", { user: check, userdata: userData });
  } catch (error) {
    console.log(error.message);
  }
};

const updateuser = async (req, res) => {
  try {
    const id = req.body.id;
    const updated = await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.phone,
        },
      }
    );
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const checkout = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    userSession = req.session;
    const id = req.query.addressid;
    if (userSession.user_id) {
      const userData = await User.findById({ _id: userSession.user_id });
      const coupon = await Coupon.find({});
      const completeUser = await userData.populate("cart.item.productId");
      const addressData = await Address.find({ userId: userSession.user_id });
      const selectaddress = await Address.findOne({ _id: id });
      res.render("checkout", {
        user: check,
        useraddress: addressData,
        selectedaddress: selectaddress,
        cartProducts: completeUser.cart,
        id: userSession.user_id,
        coupons: coupon,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

let order;
const placeorders = async (req, res) => {
  try {
    userSession = req.session;
    if (userSession.user_id) {
      const userData = await User.findById({ _id: userSession.user_id });
      const completeUser = await userData.populate("cart.item.productId");
      const data = await Address.findById({ _id: req.body.addressid });
      const totalPrice = completeUser.cart.totalPrice;
      if (completeUser.cart.totalPrice > 0) {
        order = Orders({
          userId: userSession.user_id,
          payment: req.body.payment,
          addressId: data,
          products: completeUser.cart,
        });

        // console.log('order'===+order);

        //   userSession.currentorder=orderData._id

        if (req.body.payment == "Cash-on-Delivery") {
          res.redirect("/ordersuccess");
        } else {
          var instance = new RazorPay({
            key_id: process.env.key_id,
            key_secret: process.env.key_secret,
          });
          let razorpayOrder = await instance.orders.create({
            amount: totalPrice * 100,
            currency: "INR",
            receipt: order._id.toString(),
          });
          console.log("order Order created", razorpayOrder);
          res.render("razorPay", {
            userId: req.session.user_id,
            order_id: razorpayOrder.id,
            total: totalPrice,
            session: req.session,
            key_id: process.env.key_id,
            user: userData,
            order: order,
            orderId: order._id.toString(),
          });
        }
      } else {
        res.redirect("/home");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const orderSuccess = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    userSession = req.session;
    await order.save();
    if (userSession.user_id) {
      const userData = await User.findById({ _id: userSession.user_id });
      const productData = await Product.find();
      for (let key of userData.cart.item) {
        for (let value of productData) {
          if (
            new String(value._id).trim() == new String(key.productId._id).trim()
          ) {
            value.quantity = value.quantity - key.qty;
            await value.save();
          }
        }
      }
      await Orders.updateOne(
        { userId: userSession.user_id, _id: userSession.currentorder },
        { $set: { status: "Bulid" } }
      );
      await User.updateOne(
        { _id: userSession.user_id },
        { $set: { "cart.item": [], "cart.totalPrice": "0" } },
        { multi: true }
      );
    }
    res.render("ordersuccesspage", { user: check });
  } catch (error) {
    console.log(error.message);
  }
};

const vieworderdetails = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    userSession = req.session;
    const vieworderid = req.query.id;
    const orderData = await Orders.findById({ _id: vieworderid });
    await orderData.populate("products.item.productId");
    const addressId = await orderData.populate("addressId");
    const addressData = await Address.find({ _id: addressId });
    res.render("vieworderdetails", {
      user: check,
      orderdetails: orderData,
      address: addressData,
      users: addressId,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrders = async (req, res) => {
  const id = req.query.id;
  const userSession = req.session;
  await Orders.findByIdAndUpdate(
    { _id: id },
    { $set: { status: "CANCELLED" } }
  );
  if (userSession.user_id) {
    const userData = await User.findById({ _id: userSession.user_id });
    const productdata = await Product.find();
    for (let key of userData.cart.item) {
      for (let value of productdata) {
        if (
          new String(value._id).trim() == new String(key.productId._id).trim()
        ) {
          value.quantity = value.quantity + key.qty;
          await value.save();
        }
      }
    }
  }
  res.redirect("/dashboard");
};

const returnOrders = async (req, res) => {
  const id = req.query.id;
  await Orders.findByIdAndUpdate(
    { _id: id },
    { $set: { status: "Order Returned" } }
  );
  res.redirect("/dashboard");
};

const editadderss = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    const id = req.query.id;
    const adderssData = await Address.findById({ _id: id });
    res.render("editaddress", { user: check, user: adderssData });
  } catch (error) {
    console.log(error.message);
  }
};

const updateaddress = async (req, res) => {
  try {
    const id = req.body.id;
    const updatedaddress = await Address.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          country: req.body.country,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          mobile: req.body.mno,
        },
      }
    );
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const editaddersscheckout = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    const id = req.query.id;
    const addressData = await Address.findById({ _id: id });
    res.render("editaddresscheckout", {
      user: check,
      useraddress: addressData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const updateaddresscheckout = async (req, res) => {
  try {
    const id = req.body.checkoutname;
    const updatedaddresscheckout = await Address.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          country: req.body.country,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          mobile: req.body.mno,
        },
      }
    );
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteaddresscheckout = async (req, res) => {
  try {
    const id = req.query.id;
    await Address.findByIdAndDelete({ _id: id });
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCart = async (req, res) => {
  try {
    const productId = req.query.id;
    userSession = req.session;
    const userData = await User.findById({ _id: userSession.user_id });
    userData.removefromCart(productId);
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

const applycoupon = async (req, res) => {
  const currentdate = new Date();
  const coupondata = await Coupon.findOne({
    $and: [
      { Couponname: req.body.couponname },
      { expiry_Data: { $gte: currentdate } },
    ],
  });
  res.send({ coupondata });
};

const razorPay = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else check = false;
    res.render("razorPay", { user: check });
  } catch (error) {
    console.log(error);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy(function (err) {
      if (err) {
        console.log();
        res.send(err);
      } else {
        res.redirect("/home");
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  loadhome,
  loginLoad,
  verifyLogin,
  loadchangepassword,
  changepasssword,
  forgotpassword,
  forgotverifyno,
  forgotverifyotp,
  resetpassword,
  loadshop,
  updateshop,
  viewProductPage,
  viewRelatedpage,
  loadOTP,
  verifyotp,
  loadcart,
  addToCart,
  editCart,
  updatecart,
  deleteCart,
  checkout,
  userdashboard,
  Ordersdetails,
  checkoutaddress,
  addaddress,
  deleteaddress,
  placeorders,
  orderSuccess,
  edituser,
  updateuser,
  vieworderdetails,
  cancelOrders,
  returnOrders,
  editadderss,
  updateaddress,
  editaddersscheckout,
  updateaddresscheckout,
  deleteaddresscheckout,
  applycoupon,
  userLogout,
  razorPay,
};
