var mongoose = require("mongoose");

const connectDB = async (url) => {
  try {
    await mongoose.connect("mongodb+srv://visnair1999:thangapan99@sneakerclub.lx4zarl.mongodb.net/SNEAKERCLUB", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    return console.log("Database connected!");
  } catch (err) {
    return console.log(err);
  }
}
module.exports = connectDB
