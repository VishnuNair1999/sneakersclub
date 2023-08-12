require('dotenv').config()
const userhelpers = require("../../helpers/userHelpers/userHelpers")
const db = require("../../models/connection")
// const mongoose = require('mongoose');
// const product=require("../../models/connection")
const { sendOtpApi, otpVerify } = require('../../api/twilio')
// const session = require('express-session')



let userSession;


module.exports = {

  // user home page

  getHome: async (req, res) => {

    userSession = req.session.user
    let banner = null
    banner = await userhelpers.getAllBanner()

    res.render('user/user', { userSession, banner })
   

  },
  

  getUserLogin: (req, res) => {

    if (req.session.user) {

      res.redirect('/')
    } else {

      res.render('user/login')
    }
  },


  

  postUserLogin: (req, res) => {
    let data = req.body
    userhelpers.doLogin(data).then((loginAction) => {
      if (loginAction.status) {
        req.session.user = loginAction.user;
        req.session.status = true

        res.send(loginAction)
      } else {
        res.send(loginAction)
      }
    })
  },



  getSignUp: (req, res) => {
    emailStatus = true
    if (req.session.loggedIn) {
      res.redirect('/login')
    } else {
      res.render("user/signup");
    }
  },


  postSignup: (req, res) => {
    let data = req.body
   console.log(data)
    userhelpers.doSignUp(data).then((response) => {
      req.session.user = response.data
      
      req.session.loggedIn = true
      res.send(response)
    })
  },




  getLogout: (req, res) => {

    req.session.user = null;
    req.session.loggedIn = false;

    res.redirect("/login");

  },


  otpLogin: async (req, res) => {
    const { mobileNumber } = req.body;
    req.session.number = mobileNumber;
    try {
      const user = await userhelpers.getUserNumber(mobileNumber);

      if (user.status !== true) {
        return res.status(200).json({ error: true, message: 'Wrong Mobile Number' });
      }
      const status = await sendOtpApi(mobileNumber);
      if (!status) {
        return res.status(200).json({ error: true, message: 'Something went wrong' });
      }
      res.status(200).json({ error: false, message: 'Otp has been send successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error occured' });
    }
  },

  otpVerify: async (req, res) => {

    const { otp } = req.body;


    let number = req.session.number
    console.log(otp, req.body, number, '--');
    const user = await db.user.findOne({ phonenumber: number }).lean().exec()
    req.session.user = user;
    console.log(user);
    try {
      const status = await otpVerify(otp, number)

      if (!status) {
        res.status(200).json({ error: false, message: 'Something went wrong' })
      }
      res.status(200).json({ error: false, message: 'Otp has been verified' })

    } catch (error) {
      res.status(500).json({ message: 'Internal server error occured' })
    }
  },


  resendOtp: async (req, res) => {
    let mobileNumber = req.session.number

    try {
      const status = await sendOtpApi(mobileNumber);
      if (!status) {
        return res.status(200).json({ error: true, message: 'Something went wrong' });
      }
      res.status(200).json({ error: false, message: 'Otp has been send successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error occured' });
    }

  },



  //SHOP

  getShop: async (req, res) => {
    userSession = req.session.user||null

    try {

      return new Promise((resolve, reject) => {
        db.Product.find().then((product) => {
            if (product) {

                res.render("user/shop",{product,userSession})
            } else {
                console.log("User not found");
            }
        })
    })
    } catch (error) {
      console.error(error);
    }




  },

  getProductDetail: async (req, res) => {
    let proId = req.params.id
    userSession = req.session.user

    userhelpers.getProductDetail(proId).then((product) => {

      res.render('user/productDetails', { product, userSession })
    })
  },

  // addToCart: async (req, res) => {
  //   if (!req.session.user) {
  //     // Redirect to the login page
  //     return res.json({
  //       status: false,
  //       message: "User not logged in",
  //       redirect: "/login",
  //     });
  //   }

  //   try {
  //     let userId = req.session.user._id;
  //     let productId = req.params.id;
  //     const response = await userhelpers.addToCart(userId, productId);
  //     if (response) {
  //       console.log("Product added to cart");
  //       res.json({ status: true, message: "Product added to cart" });
  //     } else {
  //       console.log("Product not added");
  //       res.json({ status: false, message: "Product not added" });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     res.json({ status: false, message: "An error occurred" });
  //   }
  // },
 
  getDetails: (userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.user.findOne({ _id: userId }).then((user) => {
                resolve(user)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
},


getWishList: async (req, res) => {
  let userSession = req.session.user
 
  const wishlistCount = await userhelpers.getWishListCount(userSession._id)
  userhelpers.getWishListProducts(userSession._id).then((wishlistProducts) => {
     
      res.render('user/wishList', { userSession, wishlistProducts, wishlistCount })
  })
},




addWishList: (req, res) => {
  let proId = req.body.proId
  let userId = req.session.user._id
  console.log(proId, '1');
  console.log(userId, '2');
  userhelpers.addWishList(userId, proId).then((response) => {
      console.log(response, '3');
      res.send(response)
  })
},



removeProductWishlist: (req, res) => {
  let proId = req.body.proId
  let wishListId = req.body.wishListId
  userhelpers.removeProductWishlist(proId, wishListId).then((response) => {
      res.send(response)
  })
},




}
