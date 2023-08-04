// const session = require('express-session')
const orderHelper = require ('../../helpers/userHelpers/orderHelper')
const cartHelper = require ('../../helpers/userHelpers/cartHelpers')
const userHelper = require ('../../helpers/userHelpers/userHelpers')
// const { ObjectId } = require('mongodb');
// const mongoose = require('mongoose');




module.exports = {



  // GET PROFILE
  getProfile:async (req, res) => {
    var count = null
   
    let userSession = req.session.user
    if (userSession) {
        var count = await cartHelper.getCartCount(userSession._id)

        let userData = await userHelper.getUser(userSession._id)
        let address = await orderHelper.getAddress(userSession._id)
        let orders = await orderHelper.getOrders(userSession._id)
        // let product = await orderHelpers.getProduct()
        res.render('user/profile', {  userSession, userData, count, address, orders })
    }

},



  

  // POST ADDRESS
  postAddress: (req, res) => {
   
    let data = req.body
    let userId = req.session.user._id
    console.log(userId);
    orderHelper.postAddress(data, userId).then((response) => {
      console.log(response);
        res.send(response)
    })
},










//  GET CHECKOUT
getCheckout: async (req, res) => {

  let userSession = req.session.user

  if(userSession){

    let userId = req.session.user._id
    let total = await cartHelper.totalCheckOutAmount(userId)
    let count = await cartHelper.getCartCount(userId)
  
    let address = await orderHelper.getAddress(userId)
    cartHelper.getCartItems(userId).then((cartItems) => {
        res.render('user/checkout', { cartItems, total, count, address, userSession })
    })

  }
  
},



// POST CHECKOUT


postCheckOut: async (req, res) => {
  let userId = req.session.user._id
  
  
  try {
    const data = req.body;
      
    try {
      const response = await orderHelper.placeOrder(data,userId);
      const total = data.total
      

     

      if (data.payment_option === "COD") {
        res.json({ codStatus: true })

      }else if(data.payment_option === "razorpay"){

        orderHelper.generateRazorpay('hi',response.total).then((result)=>{
          result.codeStatus = false;
          res.json(result)
        })
       } else if (data.payment_option === 'wallet') {
        res.json({ orderStatus: true, message: 'order placed successfully' })
    }


    } catch (error) {
      console.error({ error: error.message });
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
},






// GET EDIT ADDRESS
getEditAddress:(req,res)=>{
  let userId = req.session.user._id
  let addressId = req.params.id
  orderHelper.getEditAddress(addressId,userId).then((currentAddress)=>{
      res.send(currentAddress)
  })
},






// PATCH EDIT ADDRESS
patchEditAddress:(req,res)=>{
  let addressId = req.params.id
  let userId = req.session.user._id
  let userData = req.body
  orderHelper.patchEditAddress(userId,addressId,userData).then((response)=>{
      res.send(response)
  })
},

//CANCEL ORDER
cancelOrder: (req, res) => {
  let orderId = req.query.id;
  let total = req.query.total;
  let userId = req.session.user._id
 
  orderHelper.cancelOrder(orderId).then((canceled) => {
     orderHelper.addWallet(userId, total).then((walletStatus) => {
      res.send(canceled)
      })
  })
},


// RETURN ORDER
returnOrder: (req, res) => {
  let orderId = req.query.id
  let total = req.query.total
  let userId = req.session.user._id
  orderHelper.returnOrder(orderId, userId).then((returnOrderStatus) => {
      orderHelper.addWallet(userId, total).then((walletStatus) => {
          orderHelper.updatePaymentStatus(orderId, userId).then((paymentStatus) => {
          res.send(returnOrderStatus)
          })
      })
  })
},

getOrderSuccess: async (req, res) => {
  const users = req.session.user
 
  res.render('user/orderSuccess', {  users })
},


// ORDER DETAILS
orderDetails: async (req, res) => {
  let user = req.session.user;
  let count = await cartHelper.getCartCount(user._id);
  // const response = await orderHelper.getOrderDetails(req.params.id, user.userId)
  const orderStatus = await orderHelper.changeOrderStatus(req.params.id,user.userId)
  let userId = req.session.user._id;
  let orderId = req.params.id;

  // Check if orderId meets the requirements
  if (
    typeof orderId !== 'string' ||
    (orderId.length !== 12 && orderId.length !== 24) ||
    !/^[0-9a-fA-F]+$/.test(orderId)
  ) {
    return res.status(400).send('Invalid orderId');
  }

  if (
    typeof userId !== 'string' ||
    (userId.length !== 12 && userId.length !== 24) ||
    !/^[0-9a-fA-F]+$/.test(userId)
  ) 
  

  orderHelper.findOrder(orderId, userId).then((orders) => {
    orderHelper.findAddress(orderId, userId).then((address) => {
      orderHelper.findProduct(orderId, userId).then((product) => {
        let data = orderHelper.createData(orders, product, address)
        res.render('user/order-details', { data, user, count, product, address, orders, orderId,orderStatus });
      
      });
    });
  });
},


// CANCEL ORDER STATUS
changeOrderStatus: (req, res) => {
  let orderId = req.body.orderId
  let status = req.body.status
  orderHelper.changeOrderStatus(orderId, status).then((response) => {
      console.log(response);
      res.send(response)
  })
},

//DELETE ADDRESS
deleteNewAddress:async(req,res)=>{
  const addressId=req.body.addressId
  

  await orderHelper.deleteNewAddress(addressId,req.session.user._id).then((response)=>{
      res.json(response)
  })
},


VerifyPayment: async (req, res) => {
  await orderHelper.verifyPayment(req.body).then(async () => {
      await orderHelper.changePaymentStatus(req.body["order[reciept]"]).then(() => {
          res.json({ status: true })
      })

  }).catch((err) => {
      res.json({ status: false, errMsg: '' });
  })
},






}