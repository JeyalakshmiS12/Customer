

const mongoose = require('mongoose');
const  customerSchema = mongoose.Schema({
    customerName : String,
    email : String,
    phoneNumber : Number,
    address: String,
    password: String,
    registrationTime : Number,
    customerId: String
})
const customerModel = mongoose.model('customer',customerSchema)
module.exports = customerModel;