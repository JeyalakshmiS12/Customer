const mongoose = require('mongoose');
const mongodb = "mongodb://localhost:27017/CustomerProductManagement"
mongoose.connect(mongodb,{useNewUrlParser :true,useUnifiedTopology: true})
const connection = mongoose.connection
mongoose.set('useFindAndModify',false)

const customerModel = require('./customerModel')
const lookupModel = require('./lookupModel')


connection.once('open',()=>{
    console.log(`Mongo Instance Connected Successully`)})

connection.on('error', ()=> {
    console.error.bind(console, 'MongoDB connection error:')});

const CustomerService = function (app){
    this.app = app;

}

CustomerService.prototype.customerRegistration = function (input){

    let customerObj = input;

    if(customerObj){

        return customerModel.findOne({"email":customerObj.email},{_id:0})
            .then((response)=>{
                   if(response){
                        return null;
                   }
                   else{
                        return lookupModel.findOne({"type":"CUSTOMER"})
                            .then((res)=>{
                                customerObj.customerId ="CUS"+res.id;
                                customerObj.registrationTime= new Date().getTime();
                                return lookupModel.findOneAndUpdate({"type":"CUSTOMER"},{$inc:{id:1}},{new:true})
                                    .then((updatedResult)=>{
                                        let customerModelInstance = new customerModel(customerObj);
                                        return customerModelInstance.save()
                                    })
                                    .then((response)=>{
                                        return response;
                                    })
                                    .catch((err) =>{return err})
                            })
                   }
            })
    }
    else{
        return {};
    }
}
CustomerService.prototype.login = function (input){

    return new Promise((resolve,reject)=>{

        return customerModel.findOne({"email":input.email,"password":input.password},{_id:0})
            .then((response)=>{
                resolve(response);
            })
            .catch((e)=>{
                reject(e)
            })


    })

}
CustomerService.prototype.customerDetails = function (input){

    console.log("Iput",input)
    return new Promise((resolve,reject)=>{

        return customerModel.findOne({"email":input.email,"customerName":input.customerName})
                .then((response)=>{
                    console.log("res",response)
                    resolve(response);
                })
                .catch((e)=>{
                    reject(e)
                })
    })
}
CustomerService.prototype.customersList = function (){
    let response ={
        customerId:[],
        customerDetails:[]
    }
    return customerModel.distinct('customerId')
        .then((result)=>{
            response['customerId'] = result;
            return response;
        })
}



module.exports = CustomerService;