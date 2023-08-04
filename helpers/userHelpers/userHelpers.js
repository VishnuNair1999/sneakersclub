// const { model } = require("mongoose")
const db = require("../../models/connection")
const bcrypt = require("bcrypt")



module.exports={

 

  doSignUp:(data) => {
    let obj = {}
    return new Promise(async (resolve, reject) => {
        try {
            await db.user.findOne({ email: data.email }).then(async (res) => {
                if (!res) {
                    data.password = await bcrypt.hash(data.password, 10)
                    userData = {
                        username: data.username,
                        email: data.email,
                        phonenumber: data.phonenumber,
                        password: data.password

                    // Password: hashedPassword
                        

                    }
                    let userDb = await db.user(userData)
                    userDb.save()
                    obj.status = true
                    obj.data = userDb

                    resolve(obj)
                } else {

                    resolve({ status: false })
                }
            })

        } catch (error) {
            console.log(error, "Login failed");
        }
    })
},


  doLogin: (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.user.findOne({ email: data.email }).then((user) => {
                let response = {}
                if (user) {
                    if (user.status == true) {
                        bcrypt.compare(data.password, user.password).then((loginTrue) => {
                            if (loginTrue) {
                                response.user = user
                                response.status = true
                                resolve(response)
                            } else {
                                console.log("login failed");
                                resolve({ status: false })
                            }
                        })
                    } else {
                        resolve({ blocked: true })
                    }
                } else {
                    console.log("login failed");
                    resolve({ status: false })
                }
            })
        } catch (error) {
            console.log(error.message);
        }
    })
},



  getUserNumber: (mobileNumber) => {
    try {
      return new Promise((resolve, reject) => {
        db.user.find({ phonenumber: mobileNumber }).then((user) => {
          if (user) {
            resolve({status : true , message : "User found"});
          } else {
            resolve({status : false , message : "User not found"})
          }
        }).catch((error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },


  //GET SHOP PRODUCTS

  getShopProducts:(req)=>{

    return new Promise((resolve,reject)=>{
      db.Product.find().then((product)=>{
        if(product){
          resolve(product)
        }else{
          reject(console.log("erorr"))
        }
      })
    })


  },


  getShopProducts: (req) => {
    return new Promise((resolve, reject) => {
      db.Product.find().then((product) => {
        if (product) {
          resolve(product);
        } else {
          reject(new Error("No products found"));
        }
      }).catch((error) => {
        reject(error); // Propagate any error occurred during the find() operation
      });
    });
  },



  getProductDetail: (proId) => {
    try {
        return new Promise((resolve, reject) => {
            db.Product.findOne({ _id: proId }).then((product) => {
                resolve(product)
            })
        })
    } catch (error) {
        console.log(error.message);
    }
},



//  GET USER
getUser: (userId) => {
  try {
      return new Promise((resolve, reject) => {
          db.user.findById({ _id: userId }).then((response) => {
              resolve(response)
          })
      })
  } catch (error) {
      console.log(error.message);
  }
},


getAllBanner: () => {
  return new Promise((resolve, reject) => {
      db.Banner.find().then((response) => {
          resolve(response)
      }).catch(error => {
          resolve(error)
      })
  })
},






}



