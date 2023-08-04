// const { response } = require('express')

const db = require('../../models/connection')
const { ObjectId } = require('mongodb');
// const { data } = require('jquery');
// const { Collection } = require('mongoose');




module.exports = {



  // ADD TO CART
  addToCart: (proId, userId) => {
    console.log(proId,userId);
    try {
      return new Promise((resolve, reject) => {
        db.Cart.findOne({ user: userId }).then(async (cart) => {
          if (cart) {
            let productExist = cart.cartItems.findIndex((cartItem) => cartItem.productId.toString() === proId.toString());
            if (productExist !== -1) {
              db.Cart.updateOne(
                { user: userId, "cartItems.productId": proId },
                { $inc: { "cartItems.$.quantity": 1 } }
              ).then((response) => {
                resolve({ response, status: false });
              });
            } else {
              db.Cart.updateOne({ user: userId }, { $push: { cartItems: { productId: proId, quantity: 1 } } }).then(
                (response) => {
                  resolve({ status: true });
                }
              );
            }
          } else {
            let newCart = await db.Cart({ user: userId, cartItems: [{ productId: proId, quantity: 1 }] });
            await newCart.save().then((response) => {
              resolve({ status: true });
            });
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  
  




  // GET CART COUNT
  getCartCount: (userId) => {
    return new Promise((resolve, reject) => {
      let count = 0
      db.Cart.findOne({ user: userId }).then((cart) => {
        if (cart) {
          count = cart.cartItems.length;
        }
        resolve(count)
      })
    })
  },




  // UPDATE QUANTITY
  updateQuantity: async (cartId, proId, count, quantity, userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        if (count == -1 && quantity == 1) {
          await db.Cart.updateOne(
            { _id: cartId },
            { $pull: { cartItems: { productId: proId } } }
          );
          resolve({ status: true });
        } else {
          await db.Cart.updateOne(
            { _id: cartId, "cartItems.productId": proId },
            { $inc: { "cartItems.$.quantity": count } }
          );
          const cart = await db.Cart.findOne(
            { _id: cartId, "cartItems.productId": proId },
            { "cartItems.$": 1 }
          );
          if (cart && cart.cartItems && cart.cartItems.length > 0) {
            const newQuantity = cart.cartItems[0].quantity;
            resolve({ status: true, newQuantity: newQuantity });
          } else {
            resolve({ status: false, newQuantity: 0 });
          }
        }
      });
    } catch (error) {
      console.log(error.message);
      throw new Error('Failed to update quantity');
    }
  }
  , 
 
  
  // GET CART ITEMS
  getCartItems: (userId) => {
    try {
      return new Promise((resolve, reject) => {
        db.Cart.aggregate([
          {
            $match: {
              user: new ObjectId(userId)
            },
          },
          {
            $unwind: '$cartItems'
          },
          {
            $project: {
               item: "$cartItems.productId",
              quantity: "$cartItems.quantity"
            }
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "carted"
            }
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              carted: { $arrayElemAt: ["$carted", 0] }
            }
          }
        ])
          .then((cartItems) => {
            for(let i=0; i<cartItems.length; i++){
              cartItems[i].subtotal = cartItems[i].carted.price*cartItems[i].quantity
            }
            
            resolve(cartItems)
          })
      })
    } catch (error) {
      console.log(error.message);
    }
  },




  // TOTAL AMOUNT 
  totalCheckOutAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.Cart
        .aggregate([
          {
            $match: {
              user: new ObjectId(userId),
            },
          },
          {
            $unwind: "$cartItems",
          },

          {
            $project: {
              item: "$cartItems.productId",
              quantity: "$cartItems.quantity",
            },
          },

          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "carted",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$carted", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            },
          },
        ])
        .then((total) => {
          resolve(total[0]?.total);
        });
    });
  },





  // SUB TOTAL
  subTotal: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.Cart
        .aggregate([
          {
            $match: {
              user: new ObjectId(userId),
            },
          },

          {
            $unwind: "$cartItems",
          },

          {
            $project: {
              item: "$cartItems.productId",
              quantity: "$cartItems.quantity",
            },
          },

          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "carted",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,

              price: {
                $arrayElemAt: ["$carted.price", 0],
              },
            },
          },
          {
            $project: {
              total: { $multiply: ["$quantity", "$price"] },
            },
          },
        ])
        .then((total) => {
       
          resolve(total);
        });
    });
  },




  //  DELETE PRODUCT
  deleteProduct: async(data)=>{
    let cartId = data.cartId
    let proId = data.proId

    return new Promise((resolve,reject) =>{ 
      db.Cart.updateOne({_id: cartId},{$pull: {cartItems: {productId: proId}}}).then(() =>{ resolve ({status: true})})
    })
    .catch((error) =>{
      console.log(error.message);
    })
  },
 //CART QUANTITY
//  changeProductQuantity: async(details) => {
//   const userId=details.user
//   const proId=details.product
//   const quantity = parseInt(details.quantity)
//   const count = parseInt(details.count)
//   return new Promise(async(resolve, reject) => {
//       if (count == -1 && quantity == 1) {
//           db.Cart.updateOne({ _id: details.cart },
//               {
//                   $pull: { cartItems: { productId: details.product } }
//               }).then((response) => {
//                   resolve({ removeProduct: true })
//               })
//       } else {
//           const productDetails = await db.Product.find({ _id: proId });
//           const cartProduct = await db.Cart.find({ user: userId, 'cartItems.productId': proId });
//           const cartItem = cartProduct.cartItems.find(item => item.productId.toString() === proId.toString());

         
//           if(count==1){

//           if (cartItem.Quantity <= productDetails.Quantity - 1) {
//           await db.Cart
//               .updateOne({ _id: details.cart, 'cartItems.productId': details.product },
//                   { $inc: { 'cartItems.$.Quantity': count } }).then(() => {


//                   }).then(() => {
//                       resolve({ status: true })
//                   })
//               }else{
//                   resolve({status:false})
//               }
//       }else{
//           await db.Cart
//               .updateOne({ _id: details.cart, 'cartItems.productId': details.product },
//                   { $inc: { 'cartItems.$.Quantity': count } }).then(() => {


//                   }).then(() => {
//                       resolve({ status: true })
//                   })

//       }
//   }

//   })
// },





}