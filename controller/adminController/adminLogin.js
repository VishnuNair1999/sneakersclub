
const user = require('../../models/connection')
const adminHelper = require('../../helpers/adminHelpers/adminLoginHelper')
// const auth = require('../../middlewares/middleware')
// const session = require('express-session')
// const orderHelper = require ('../../helpers/userHelpers/orderHelper')
const adminOrderHelper = require('../../helpers/adminHelpers/adminOrderHelper')




// GET SIGNUP

module.exports = {


  
  getLogin: (req, res) => {
    if (req.session.admin) {
      res.redirect("/admin")
    } else {
      res.render('admin/admin-login')
    }

  },


  postLogin: (req, res) => {

    console.log(req.body)
    if (
      req.body.email === process.env.ADMIN_EMAIL &&
      req.body.password === process.env.ADMIN_PASSWORD
    ) {
      req.session.admin = true;
      res.redirect("/admin");
    } else {
      res.redirect("/admin/login");
    }
  },

getDashboard:async (req, res) => {
  if (req.session.admin) {

    let admin = req.session.admin
    let totalProducts,
          days = [];
      let ordersPerDay = {};
      let paymentCount = [];

      let Products = await adminHelper.getAllProducts();
      totalProducts = Products.length;

      await adminOrderHelper.getOrderByDate().then((response) => {

          let result = response;
          for (let i = 0; i < result.length; i++) {
              for (let j = 0; j < result[i].orders.length; j++) {
                  let ans = {};
                  ans["createdAt"] = result[i].orders[j].createdAt;
                  days.push(ans);
              }
          }

          days.forEach((order) => {
              let day = order.createdAt.toLocaleDateString("en-US", {
                  weekday: "long",
              });
              ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;

          });
      });

      let getCodCount = await adminHelper.getCodCount();
      let codCount = getCodCount.length;

      let getOnlineCount = await adminHelper.getOnlineCount();
      let onlineCount = getOnlineCount.length;

      let getWalletCount = await adminHelper.getWalletCount();
      let WalletCount = getWalletCount.length;

      paymentCount.push(onlineCount);
      paymentCount.push(codCount);
      paymentCount.push(WalletCount);

      let orderByCategory = await adminOrderHelper.getOrderByCategory()


      let Men = 0, Women = 0, Kids = 0;

      orderByCategory.forEach((order) => {
          order.forEach((product) => {
              if (product.category === 'Men') Men += product.quantity;
              else if (product.category === 'Women') Women += product.quantity;
              else if (product.category === 'Kids') Kids += product.quantity;
          });
      });

      let category = [Men, Women, Kids];

      adminOrderHelper.getAllOrders().then((response) => {

          let length = response;

          adminOrderHelper.getAllOrdersSum().then((response) => {
              let total = response

    res.render('admin/admin-dashboard', {admin,length,total,totalProducts,ordersPerDay,  paymentCount,category, dashboard: true
              })
          });
      });
    // res.render('admin/admin-dashboard', { layout: 'admin-layout', admin, dashboard: true })
  } else {
    res.redirect('/admin/admin-login')
  }

},


  doLogout: (req, res) => {
    req.session.admin = null
    res.redirect = ('/admin/login')

  },


  getLogout: (req, res) => {

    req.session.admin = null;
    req.session.loggedIn = false;

    res.redirect("/admin/login");

  },



  getUser: (req, res) => {


    let admin = req.session.admin
    adminHelper.getUserList().then((user) => {
      res.render('admin/admin-userList', {  user, admin })
    })
  },


  changeUserStatus: (req, res) => {
    let userId = req.query.id
    let status = req.query.status
    if (status === 'false') {
      req.session.user = null
    }
    adminHelper.changeUserHStatus(userId, status).then((status) => {
      res.send(status)
    })
  },


  getAddProduct: async (req, res) => {

    let admin = req.session.admin
    let categories = await user.Category.find()
    res.render('admin/addProduct', {  categories, admin })
  },
  

  getProductList: (req, res) => {
    let admin = req.session.admin
    adminHelper.getProductList().then((product) => {

      res.render('admin/productList', {  product, admin })
    })
  },


  getEditProduct: (req, res) => {
    let admin = req.session.admin
    let proId = req.params.id;
    adminHelper.getEditProduct(proId).then(async (product) => {
      let category = await user.Category.find()
      res.render('admin/editProduct', { product, category, admin })
    })

  },



  postEditProduct: async (req, res) => {
    let proId = req.params.id
    let file = req.files
    let image = [];

    let previousImages = await adminHelper.getPreviousImages(proId)

   

    if (req.files.image1) {
      image.push(req.files.image1[0].filename)
    } else {
      image.push(previousImages[0])
    }

    if (req.files.image2) {
      image.push(req.files.image2[0].filename)
    } else {
      image.push(previousImages[1])
    }
    if (req.files.image3) {
      image.push(req.files.image3[0].filename)
    } else {
      image.push(previousImages[2])
    }
    if (req.files.image4) {
      image.push(req.files.image4[0].filename)
    } else {
      image.push(previousImages[3])
    }

    adminHelper.postEditProduct(proId, req.body, image).then(() => {
      res.redirect('/admin/productList')
    })
  },


 



  //POST ADD PRODUCT

  postAddProduct: (req, res) => {
    let file = req.files
    const fileName = file.map((file) => {
      return file.filename
    })
    // console.log(file);
    const product = req.body
    product.img = fileName
    adminHelper.postAddProduct(product).then(() => {
      res.render('admin/admin-dashboard')
    })
  },


  //GET ADD CATEGORY

  getAddCategory: async (req, res) => {
    let admin = req.session.admin
    let categories = await user.Category.find()
    res.render('admin/addCategory', {  categories, admin })
  },


  //POST ADD CATEGORY

  postAddCategory: (req, res) => {
    let data = req.body
    adminHelper.postAddCategory(data).then((category) => {
      res.send(category)
    })
  },

  //EDIT CATEGORY

  handleEditCategorys: async (req, res) => {
    try {
      const catId = req.params.id;
      const category = await user.Category.findById(catId)
      if (category) {
        // console.log(category, 'category');
        res.status(200).json(category);
      } else {
        res.status(404).json({ message: 'Somthing went wrong..' });
      }

    } catch (error) {
      res.status(404).redirect('/error')
    }
  },


  //EDIT CATEGORY PATCH

  handleEditCategoryPatch: async (req, res) => {
    try {
      // Check if sub-category already exists in the database
      const category = await user.Category.findOne({
        _id: req.body._id,
        sub_category: {
          $elemMatch: {
            name: req.body.newSubCat
          }
        }
      });

      if (category) {
        // Sub-category already exists, update the discount and dates
        await user.Category.updateOne(
          { _id: req.body._id, "sub_category.name": req.body.newSubCat },
          {
            $set: {
              "sub_category.$.offer.discount": req.body.offer_percentage,
              "sub_category.$.offer.validFrom": req.body.valid_from,
              "sub_category.$.offer.validTo": req.body.valid_to
            }
          }
        );
        // Find all products associated with the subcategory and update their prices
        const products = await user.Product.find({ sub_category: req.body.newSubCat })
        products.forEach(async (product) => {
          const originalPrice = product.price
          const discount = req.body.offer_percentage / 100
          const discountedPrice = Math.floor(originalPrice - (originalPrice * discount));
          // console.log(discountedPrice,'discount');
          // console.log(originalPrice,'originalPrice');
          // console.log(req.body.discount,'req.body.discount');
          // console.log(req.body,'req.body');

          await user.Product.updateOne(
            { _id: product._id },
            {
              $set: {
                discountedPrice: discountedPrice
              }
            })
        })
      } else {
        // Sub-category doesn't exist, push it into the sub_category array with the discount and dates
        await user.Category.updateOne(
          { _id: req.body._id },
          {
            $push: {
              sub_category: {
                name: req.body.newSubCat,
                offer: {
                  discount: req.body.offer_percentage,
                  validFrom: req.body.valid_from,
                  validTo: req.body.valid_to
                }
              }
            }
          }
        );
      }

      res.status(200).json({ message: "Sub-category updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },


  //GET SUB CATEGORY

  getSubCategory: (req, res) => {
    let data = req.body
    adminHelper.getSubCategory(data).then((subCategory) => {
      res.send(subCategory)
    })
  },

  //REMOVE SUB CATEGORY

  removeSubCategory: (req, res) => {
    let cartId = req.params.id
    adminHelper.deleteSubCategory(cartId, req.body.newSubCat).then((response) => {
      res.send(response)
    })
  },


  //DELETE CATEGORY

  deleteCategory: (req, res) => {
    let catId = req.params.id
    adminHelper.deleteCategory(catId).then((response) => {
      res.send(response)
    })
  },


  //LIST AND UNLIST PRODUCT 

  UnlistProduct: async (req, res) => {
    let condition = (req.body.condition);
    let proId = req.body.proId;
    await adminHelper.unlistProduct(proId, condition).then((product) => {
      res.json(true);
    });
  },

// SALES REPORT
getSalesReport: async (req, res) => {
  let admin = req.session.admin
  let report = await adminHelper.getSalesReport()
  let details = []
  const getDate = (date) => {
      let orderDate = new Date(date)
      let day = orderDate.getDate()
      let month = orderDate.getMonth() + 1
      let year = orderDate.getFullYear()
      return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`
  }

  report.forEach((orders) => {
      details.push(orders.orders)
  })

  res.render("admin/salesReport", { admin, details, getDate, salles: true })
},


// POST SALES REPORT
postSalesReport: (req, res) => {

let admin = req.session.admin
let details = []
const getDate = (date) => {
    let orderDate = new Date(date)
    let day = orderDate.getDate()
    let month = orderDate.getMonth() + 1
    let year = orderDate.getFullYear()
    return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`
}

adminHelper.postReport(req.body).then((orderData) => {
    orderData.forEach((orders) => {
        details.push(orders.orders)
    })

    res.render("admin/salesReport", {  admin, details, getDate })
})

},






// ADD BANNER
getAddBanner: (req, res) => {
let admin = req.session.admin
res.render('admin/addBanner', { admin })
},



postAddBanner: (req, res) => {

adminHelper.addBanner(req.body, req.file.filename).then((response) => {
    if (response) {
        
        res.send({ status: true })
    } else {
        res.send({ status: false });
    }
});
},




getBannerList: (req, res) => {
let admin = req.session.admin
adminHelper.getBannerList().then((banner) => {
    
    res.render('admin/bannerList', { admin, banner })
})
},




getEditBanner: (req, res) => {
let admin = req.session.admin
adminHelper.getEditBanner(req.query.banner).then((banner) => {
    res.render("admin/editBanner", {  admin, banner })
})
},





postEditBanner: (req, res) => {
console.log(req.query.editbanner, 'req.query.editbanner');
console.log(req.body, 'req.body');
console.log(req?.file?.filename, ' req?.file?.filename');
adminHelper.postEditBanner(req.query.editbanner, req.body, req?.file?.filename).then((response) => {
    res.redirect("/admin/banner-list")
})
},




deleteBanner: (req, res) => {
adminHelper.deleteBanner(req.params.id).then((response) => {
    res.send(response)
})
}
















}









