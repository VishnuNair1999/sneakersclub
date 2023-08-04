const db = require ('../../models/connection')

const { ObjectId } = require('mongodb')

module.exports = {

    getOrders: (userId) => {
        try {
            return new Promise((resolve, reject) => {
                db.Order.findOne({ user: userId }).then((user) => {
                    resolve(user)
                })
            })
        } catch (error) {
            console.log(error.message);
        }
      },

    getOrderList: () => {
        return new Promise(async (resolve, reject) => {
            await db.Order.aggregate([
                { $unwind: '$orders' },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userDetails'
    
                    }
                },
                { $unwind: '$userDetails' },
                {
                    $project: {
                        orderId: '$orders._id',
                        userId: '$userDetails._id',
                        userName: '$userDetails.username',
                        total: '$orders.totalPrice',
                        status: '$orders.orderConfirm',
                        date: '$orders.creditedAt'
                    }
                }
            ]).then((response) => {
    
                resolve(response)
            })
        })
    },
    
    
      getOrderByDate: () => {
        return new Promise(async (resolve, reject) => {
            const startDate = new Date();
            try {
                const response = await db.Order.find({ 'orders.createdAt': { $lt: startDate } });
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    },
    
    
    
    
    getOrderByCategory: () => {
      return new Promise(async (resolve, reject) => {
          await db.Order.aggregate([
              { $unwind: "$orders" },
          ]).then((response) => {
              const productDetails = response.map(order => order.orders.productDetails);
              resolve(productDetails)
    
          })
      })
    },
    
    
    
    
    
    getAllOrders: () => {
      try {
        return new Promise((resolve, reject) => {
          db.Order.find().then((orders) => {
            let totalOrders = 0;
            orders.forEach((order) => {
              totalOrders += order.orders.length;
            });
            resolve(totalOrders);
          });
        });
      } catch (error) {
        console.log(error.message);
      }
    },
    
    
    
    getAllOrdersSum: () => {
      try {
        return new Promise((resolve, reject) => {
          db.Order.find().then((orders) => {
            let totalSum = 0;
            orders.forEach((order) => {
              order.orders.forEach((item) => {
                totalSum += item.totalPrice;
              });
            });
            resolve(totalSum);
          });
        });
      } catch (error) {
        console.log(error.message);
      }
    },
    
    getOrderDetails: (orderId, userId) => {
    
      return new Promise(async (resolve, reject) => {
          await db.Order.aggregate([
              { $match: { user: new ObjectId(userId) } },
              { $unwind: '$orders' },
              { $match: { 'orders._id': new ObjectId(orderId) } },
              {
                  $project: {
                      orderId: '$orders._id',
                      paymentMethod: '$orders.paymentMethod',
                      paymentStatus: '$orders.paymentStatus',
                      totalPrice: '$orders.totalPrice',
                      productDetails: '$orders.productDetails',
                      shippingAddress: '$orders.shippingAddress',
                      dateAndTime: '$orders.creditedAt',
                      orderConfirm: '$orders.orderConfirm',
                      subTotal: { $multiply: ["$productDetails.quantity", "$productPrice"] },
                  }
              },
              { $unwind: '$productDetails' },
              {
                  $project: {
                      orderId: 1,
                      paymentMethod: 1,
                      paymentStatus: 1,
                      totalPrice: 1,
                      productDetails: 1,
                      shippingAddress: 1,
                      dateAndTime: 1,
                      orderConfirm: 1,
                      subTotal: { $multiply: ["$productDetails.quantity", "$productDetails.productPrice"] },
                  }
              }
    
    
    
          ]).then((response) => {
              resolve(response)
    
          })
      })
    },


    // GET ORDER ADDRESS
getOrderAddress: (userId, orderId) => {
    return new Promise((resolve, reject) => {
        db.Order.aggregate([
            {
                $match: {
                    "user": new ObjectId(userId)
                }
            },
            {
                $unwind: "$orders"
            },
            {
                $match: {
                    "orders._id": new ObjectId(orderId)
                }
            },
            {
                $unwind: "$orders.shippingAddress"
            },
            {
                $project: {
                    "shippingAddress": "$orders.shippingAddress"
                }
            }
        ]).then((address) => {
            resolve(address)
        })

    })
},






// GET SUBORDER
getSubOrders: (orderId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $match: {
                        'user': new ObjectId(userId)
                    }
                },
                {
                    $unwind: '$orders'
  
                },
                {
                    $match: {
                        'orders._id': new ObjectId(orderId)
                    }
                }
  
            ]).then((order) => {
                resolve(order)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
  },





// GET ORDERED PRODUCTS
getOrderedProducts: (orderId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $match: {
                        "user": new ObjectId(userId)
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders._id": new ObjectId(orderId)
                    }
                },
                {
                    $unwind: "$orders.productDetails"
                },
                {
                    $project: {
                        "productDetails": "$orders.productDetails"
                    }
                }
            ]).then((response) => {
                resolve(response)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
  },
  
  





// GET TOTAL
getTotal: (orderId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $match: {
                        "user": new ObjectId(userId)
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders._id": new ObjectId(orderId)
                    }
                },
                {
                    $unwind: "$orders.productDetails"
                },
                {
                    $project: {
                        "productDetails": "$orders.productDetails",
  
                        "totalPrice": { $multiply: ["$orders.productDetails.productPrice", "$orders.productDetails.quantity"] }
                    }
                }
            ]).then((response) => {
                resolve(response)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
  },
  
  






// GET OREDERED TOTAL
getOrderTotal: (orderId, userId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Order.aggregate([
                {
                    $match: {
                        "user": new ObjectId(userId)
                    }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: {
                        "orders._id": new ObjectId(orderId)
                    }
                },
                {
                    $unwind: "$orders.productDetails"
                },
                {
                    $group: {
                        _id: "$orders._id",
                        totalPrice: { $sum: "$orders.productDetails.productPrice" }
                    }
                }
  
            ]).then((response) => {
                if (response && response.length > 0) {
                    const orderTotal = response[0].totalPrice
                    resolve(orderTotal)
                }
            })
        })
    } catch (error) {
        console.log(error.message);
    }
  },
}