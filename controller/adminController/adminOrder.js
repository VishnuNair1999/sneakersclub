// const session = require('express-session')
const adminHelper = require('../../helpers/adminHelpers/adminLoginHelper')
// const auth = require ('../../middlewares/middleware')
const adminOrderHelper = require ('../../helpers/adminHelpers/adminOrderHelper')

const userController = require ('../../controller/userController/userController')
const couponHelper = require ('../../helpers/adminHelpers/adminCouponHelper')
module.exports={

// GET ORDER LIST 
getOrderList: (req, res) => {
  let userId = req.params.id
  let admin = req.session.admin
  //adminOrderHelper.getAddress(userId).then((address) => {
  adminHelper.getUserList(userId).then((user) => {
     
      adminOrderHelper.getOrders(userId).then((order) => {
         
          res.render('admin/orderList', {  user, userId, admin, order, userPage: true })
      })
  })

},

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



//  GET ORDER DETAILS
getOrderDetails: async (req, res) => {
    console.log("getOrderDetails function is called.");
    
  let admin = req.session.admin
  console.log(admin)
  let orderId = req.query.orderId
  console.log(orderId)
  let userId = req.query.userId
  console.log(userId)
  let userDetails = await userController.getDetails(userId)
 adminOrderHelper.getOrderDetails(orderId, userId).then((paymentMethod,paymentStatus) =>{
    console.log(paymentMethod,paymentStatus);
  adminOrderHelper.getOrderAddress(userId, orderId).then((address) => {
      adminOrderHelper.getSubOrders(orderId, userId).then((orderDetails) => {
          adminOrderHelper.getOrderedProducts(orderId, userId).then((product) => {
              adminOrderHelper.getTotal(orderId, userId).then((productTotalPrice) => {
                  adminOrderHelper.getOrderTotal(orderId, userId).then((orderTotalPrice) => {
                    
   
           res.render('admin/orderDetails', { admin, userDetails, address, product, orderId,orderDetails, productTotalPrice, orderTotalPrice,paymentMethod,paymentStatus
                      })
                  })
              })
          })
      })
  })
})
},




// GET COUPON LIST  
getCoupon:(req,res)=>{
    if (req.session.admin) {

        let admin = req.session.admin
        couponHelper.getCouponList().then((couponList)=>{
        res.render('admin/couponList', { admin , couponList, coupon: true})
        })    
      } else {
        res.redirect('/admin/admin-login')
      }
},




// GENERATE COUPON CODE
generatorCouponCode: (req, res) => {
    couponHelper.generatorCouponCode().then((couponCode) => {
      
        res.send(couponCode)
    })
},


// POST ADD COUPON
postaddCoupon: (req, res) => {
    let data = {
        couponCode: req.body.coupon,
        validity: req.body.validity,
        minPurchase: req.body.minPurchase,
        minDiscountPercentage: req.body.minDiscountPercentage,
        maxDiscountValue: req.body.maxDiscount,
        description: req.body.description
    }
    couponHelper.postaddCoupon(data).then((response) => {
        res.send(response)
    })
},


getCouponList: (req, res) => {
    let admin = req.session.admin
    couponHelper.getCouponList().then((couponList) => {
        res.render('admin/couponList', {  admin, couponList })
    })
},




removeCoupon: (req, res) => {
    let couponId = req.body.couponId
    couponHelper.removeCoupon(couponId).then((successResponse) => {
        res.send(successResponse)
    })
},



getAddCoupon: (req, res) => {
    let admin = req.session.admin
    res.render('admin/addCoupon', {  admin, coupon: true  })
},


}