const express = require('express');
const router = express.Router();
const auth = require('../middlewares/middleware')
const controllers = require("../controller/userController/userController")
const cartController = require("../controller/userController/cartController")
const orderController=require("../controller/userController/orderController");




// GET HOME 
router.get("/",controllers.getHome)



// GET USER LOGIN
router.get("/login",auth.userauth, controllers.getUserLogin)



// POST UER LOGIN
router.post("/login",controllers.postUserLogin)



// GET SIGNUP
router.get("/signup", controllers.getSignUp)




// POST SIGNUP
router.post("/signup", controllers.postSignup)




// GET LOGOUT
router.get("/logout", controllers.getLogout);



// OTP

router.post('/otp-login', controllers.otpLogin)

router.post('/otp-verify', controllers.otpVerify)

router.post('/resend-otp', controllers.resendOtp)




//  USER PRODUCT
router.get('/shop',controllers.getShop)




// PRODUCT DETAILS
router.get('/product-detail/:id',controllers.getProductDetail)



// ADD TO CART
router.get('/cart',cartController.getCart)




// POST ADD TO CART
router.post('/addToCart/:id',cartController.addToCart)




 // DELETE PRODUCT IN CART
 router.delete('/deleteCart/:id',cartController.deleteProduct)



 //  GET CHECKOUT
 router.get('/check-out',auth.userauth,orderController.getCheckout)





 // POST CHECKOUT
 router.post('/checkout',orderController.postCheckOut)





// //  GET PROFILE
 router.get('/get-profile',auth.userauth,orderController.getProfile)





// POST ADD ADDRESS
router.post('/add-address',auth.userauth,orderController.postAddress)





// GET EDIT ADDRESS
router.route('/edit-address/:id').get(orderController.getEditAddress).patch(orderController.patchEditAddress)

//DELETE ADDRESS
router.delete('/deleteNewAddress',orderController.deleteNewAddress)

//CART QUANTITY
router.post('/change-product-quantity',cartController.updateQuantity)
    

// GER ORDER DETAILS
router.get('/order-details/:id',auth.userauth,orderController.orderDetails)


// CANCEL ORDER
router.post('/cancel-order',orderController.cancelOrder)


// RETURN ORDER 
router.route('/return-order/').post(orderController.returnOrder)

router.get('/orderSuccess',auth.userauth,orderController.getOrderSuccess)

// VERIFY PAYMENTS
router.post('/verify-payment',auth.userauth,orderController.VerifyPayment)

//cpupon
router.post('/validateCode',orderController.validateCoupon)
//  WISHLIST

router.get('/wish-list',controllers.getWishList)

 router.route('/add-to-wishlist').post(controllers.addWishList)

 router.route('/remove-product-wishlist').delete(controllers.removeProductWishlist)





module.exports = router;


