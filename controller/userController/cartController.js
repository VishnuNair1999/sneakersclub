
// const { response } = require('express')
const cartHelper = require('../../helpers/userHelpers/cartHelpers')








module.exports = {



  // GET CART
  getCart: async (req, res) => {
    try{ 
      
      if (req.session.user) {
        
      
        let userId = req.session.user._id
      
        let userSession = req.session.user
        
  
        let subTotal = await cartHelper.subTotal()
        
        let total = await cartHelper.totalCheckOutAmount(userId)
        
  
        cartHelper.getCartItems(userId).then((cartItems)=>{
         
        cartHelper.getCartCount(userId).then((count)=>{
        res.render('user/cart',{ cartItems, subTotal, total, userSession,count})
  
          })
        }) 
  
      } else {
        res.render('user/GuestCart')
      }
    }
      catch(err){
        console.log(err)
      }
    },




  addToCart: (req, res) => {

    cartHelper.addToCart(req.params.id,req.session.user._id).then((response)=>{
     
      res.send(response)
    
    })
  },
  // addToCart: async (req, res) => {
  
  //   try {
  //     let userId = req.session.user._id;
  //     let productId = req.params.id;
  //     const response = await cartHelper.addToCart(userId, productId);
  //     if (response.status) {
     
  //       console.log("Product added to cart");
  //       res.json({ status: true, message: "Product added to cart" });
    //   } else {
    //     console.log("Product not added");
    //     res.json({ status: false, message: "Product not added" });
    //   }
    // } catch (error) {
    //   console.error(error);
    //   res.json({ status: false, message: "An error occurred" });
    // }
  // },
  







  // POST UPDATE QUANTITY CART
  updateQuantity: async (req, res) => {
    try {
      const { cart, product, count, quantity } = req.body;
      let userId = req.session.user._id;
  
      const response = await cartHelper.updateQuantity(cart, product, count, quantity, userId);
  
      if (response.status) {
        response.total = await cartHelper.totalCheckOutAmount(userId);
        response.subTotal = await cartHelper.subTotal(userId);
      }
  
      res.json(response);
    } catch (error) {
      console.log(error.message);
      res.json({ status: false, error: 'Failed to update quantity' });
    }
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

  // DELETE PRODUCT
  deleteProduct:(req,res)=>{

    cartHelper.deleteProduct(req.body).then((response)=>{
      res.send(response)
    })


  }



}


