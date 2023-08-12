
// const mongoose = require("mongoose");

// const db =mongoose.createConnection("mongodb://0.0.0.0:27017/ecommerce")
//   db.on("error", console.error.bind(console, "connection error:"));
//     db.once("open", function () {
//     console.log("We're connected to the database!");
//   });

// //User Schema

const mongoose = require("mongoose");



const userschema = new mongoose.Schema({

  username: {
    type: String,
    required: true,

  },

  password: {
    type: String,
    required: true,
    // minlength: 5,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phonenumber: {
    type: Number,
    // minlength:10,
    unique: true,
  },


  status: {
    type: Boolean,
    default: true
  },
  coupons: Array

})



const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true,
    unique: true,
  }

})


const productSchema = new mongoose.Schema({

  name: {
    type: String
  },

  brand: {
    type: String
  },

  description: {
    type: String
  },

  price: {
    type: Number
  },

  quantity: {
    type: Number
  },

  category: {
    type: String
  },

  sub_category: {
    type: String
  },

  discountedPrice: {
    type: Number,
    default: 0
  },

  img: {
    type: Array
  },

  unlist: {
    type: Boolean,
    default: false
  }


})


const categorySchema = new mongoose.Schema({

  category: {
    type: String
  },

  sub_category: [{
    name: {
      type: String

    },
    offer: {
      discount: { type: Number, default: 0 },
      validFrom: { type: Date, default: undefined },
      validTo: { type: Date, default: undefined }
    }
  }]
})

const cartSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },

  cartItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
      quantity: { type: Number, default: 1 },
      price:{type:Number}
    }
  ]

})
const addressSchema = new mongoose.Schema({
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
  },

  Address: [
    {
        fname: { type: String },
        lname: { type: String },
        housename: { type: String },
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: Number },
        phone: { type: Number },
        email: { type: String }
    }
]
})



const orderSchema = new mongoose.Schema({
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
  },
  orders: [
      {
          fname: String,
          lname: String,
          mobile: Number,
          paymentMethod: String,
          paymentStatus: String,
          totalPrice: Number,
          totalQuantity: Number,
          productDetails: Array,
          shippingAddress: Object,
          discountAmount:Number,
          paymentMode: String,
          status: {
              type: String, // Update the data type to String
              default: "pending", // Set a default value if needed
          },
          paymentTypes: String,
          creditedAt: {
              type: Date,
              default: new Date(),
          },
          orderConfirm: {
              type: String,
              default: 'ordered'
          }
      }
  ]
})

const couponSchema = new mongoose.Schema({
  couponCode: {
      type: String
  },
  validity: {
      type: Date,
      default: new Date
  },
  minPurchase: { type: Number },
  minDiscountPercentage: { type: Number },
  maxDiscountValue: { type: Number },
  description: { type: String },
  createdAt: {
      type: Date,
      default: new Date
  }

})



const bannerSchema = new mongoose.Schema({
  title: {
      type: String
  },
  image: {
      type: String
  },
  mainDescription: {
      type: String
  },
  subDescription: {
      type: String
  },
  categoryOffer: {
      type: String,
      default: null
  },
  link: {
      type: String
  },
  createdAt: {
      type: Date,
      default: new Date()
  },
  updatedAt: {
      type: Date
  }
})



const wishListSchema = new mongoose.Schema({
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
  },
  wishList: [
      {
          productId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'product'
          },

          createdAt: {
              type: Date,
              default: Date.now
          }
      }
  ]
})




module.exports = {

  user: mongoose.model('user', userschema),
  admin: mongoose.model('admin', adminSchema),
  Product: mongoose.model('product', productSchema),
  Category: mongoose.model('category', categorySchema),
  Cart: mongoose.model('cart', cartSchema),
  Address: mongoose.model('address', addressSchema),
  Order: mongoose.model('order', orderSchema),
  Coupon: mongoose.model('coupon', couponSchema),
  Banner : mongoose.model('banner',bannerSchema),
  Wishlist: mongoose.model('wishlist', wishListSchema)
};
