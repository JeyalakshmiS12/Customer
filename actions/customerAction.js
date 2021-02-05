const customerService = require('../services/customerService')
const jwt = require('jsonwebtoken');
const requestPromise = require('request-promise');
let config = require('../conf');

const CustomerAction = function (app){
    this.app = app;
    this.customerServiceInstance = new customerService(app);
};

CustomerAction.prototype.registration = function (input){
    let response ={
        status:"FAILURE",
        err :{},
        data:{}
    };
    return new Promise((resolve,reject) => {
        if(input && input.email && input.password){
            return this.customerServiceInstance.customerRegistration(input)
                .then((result)=>{
                    if(result){
                        result.registrationTime ? response['data']['message'] = "Customer Registration is Successful" : response['data']['message'] = "Existing Account with Same mail"
                        response['status'] = "SUCCESS";
                    } else{
                        response['err']['message'] = "Customer Registration is Unsuccessful and Email already Exists";
                    }
                    resolve(response)
                })
                .catch(function (e) {
                    console.log(e);
                    response['err']['message'] = e.message;
                    reject(response);
                })
        } else {
            response['data']['message'] = "Don't have an email and password";
            resolve(response)
        }
    })
}

CustomerAction.prototype.login = function (input){
    let response ={
        status:"FAILURE",
        err :{},
        data:{}
    };
    return new Promise((resolve,reject) => {
        if(input && input.email && input.password){
            return this.customerServiceInstance.login(input)
                .then( (result) => {
                    if(result){
                        let token = jwt.sign({username: result.email}, config.secret, { expiresIn: '8hr'});
                        response['data']['token'] = token;
                        response['data']['message'] = "Authentication Successfull";
                        response['status'] = "SUCCESS";

                    } else{
                        response['err']['message'] = "User Email and Password is incorrect";
                    }
                    resolve(response)
                })
                .catch(function (e) {
                    console.log(e);
                    response['err']['message'] = e.message;
                    reject(response);
                })
        } else {
            response['err']['message'] = "Doesn't have email or password";
            resolve(response)
        }
    })
}

CustomerAction.prototype.tokenVerification = function(input){
// const tokenVerification = function(input){
    return new Promise((resolve,reject) =>{
        let result = jwt.verify(input.token,config.secret,{expiresIn: '8hr'})
        resolve(result);
    })

}
CustomerAction.prototype.orderCreation = function(input){
    let response ={
        status:"FAILURE",
        err :{},
        data:{}
    };

    return new Promise((resolve,reject)=>{
        if(input && input.token){
            return this.tokenVerification(input)
                .then((verificationRes)=>{
                    // console.log("",verificationRes);
                    if(verificationRes){
                        delete input.token;
                        return this.customerServiceInstance.customerDetails(input)
                            .then((customerResponse)=>{
                                input['customerId'] = customerResponse.customerId
                                console.log(`Input for Order Service`,input)
                               let options = {
                                   method: 'POST',
                                   body: input,
                                   uri: config.orderServiceCreationUrl,
                                   json: true // Automatically stringifies the body to JSON
                               }
                                return requestPromise(options)
                                    .then((orderResult)=>{
                                        console.log("OrderResult",orderResult)
                                        if(orderResult && (orderResult.status == "SUCCESS")){
                                            response['status'] = "SUCCESS"
                                            response['data']['message'] = "Order Creation Successful";
                                        } else{
                                            response['data']['message'] = "Order Creation is UnSuccessful";
                                        } resolve(response)
                                    })
                            })
                    }
                    else{
                        response['data']['message'] = "Token is not valid";
                        resolve(response)
                    }
                })
                .catch((err) => {
                    console.log(err,"err");
                    reject(err);
                })
        } else {
            response['data']['message'] = "Auth token is not supplied";
            resolve(response)
        }

    })

}
CustomerAction.prototype.orderCancellation = function (input){

    let response ={
        status:"FAILURE",
        err :{},
        data:{}
    };

    return new Promise((resolve,reject)=>{
        if(input && input.token){
            return this.tokenVerification(input)
                .then((verificationResponse)=>{
                    console.log("verificationResponse",verificationResponse)
                    if(verificationResponse){
                        delete input.token;
                        return this.customerServiceInstance.customerDetails(input)
                            .then((customerResponse)=>{
                                input['customerId'] = customerResponse.customerId
                                // console.log(`Input for Order Service`,input)
                                let options = {
                                    method: 'PUT',
                                    body: input,
                                    uri: config.orderServiceCancellationUrl,
                                    json: true // Automatically stringifies the body to JSON
                                }
                                return requestPromise(options)
                                    .then((orderResult)=>{
                                        console.log("OrderResult",orderResult)
                                        if(orderResult && (orderResult.status == "SUCCESS")){
                                            response['status'] = "SUCCESS"
                                            response['data']['message'] = "Order Cancellation Successful";
                                        } else{
                                            response['data']['message'] = "Order Cancellation is UnSuccessful";
                                        } resolve(response)
                                    })
                            })
                    }
                    else{
                        response['data']['message'] = "Token is not valid";
                        resolve(response)
                    }
                })
        }
        else{
            response['data']['message'] = "Auth token is not supplied";
            resolve(response)
        }
    })
}
CustomerAction.prototype.orderUpdation = function (input){
    console.log("Input for the Order Updation",input);
    let response ={
        status:"FAILURE",
        err :{},
        data:{}
    };
    return new Promise((resolve,reject)=>{
        if(input && input.token){
            return this.tokenVerification(input)
                .then((tokenResponse)=>{
                    if(tokenResponse){
                        delete input.token;
                        return this.customerServiceInstance.customerDetails(input)
                    } else {
                        response['data']['message'] = "Token is not valid";
                        resolve(response)
                    }
                })
                .then((result)=>{
                    input['customerId'] = result.customerId
                    console.log(`Input for Order Service`,input)
                    let options = {
                        method: 'PUT',
                        body: input,
                        uri: config.orderServiceUpdationUrl,
                        json: true // Automatically stringifies the body to JSON
                    }
                    return requestPromise(options)
                })
                .then((orderResponse)=>{
                    console.log("Order Response",orderResponse)
                    if(orderResponse && orderResponse.status == "SUCCESS"){
                        response['status'] = "SUCCESS";
                        response['data']['message'] = orderResponse.data.message;
                        resolve(response)
                    }
                })
        }
        else{
            response['data']['message'] = "Auth token is not supplied";
            resolve(response)
        }
    })
}

CustomerAction.prototype.customerInformation = function (){

    let response ={
        status:"FAILURE",
        err :{},
        data:{}
    };

    return new Promise((resolve,reject)=>{
        this.customerServiceInstance.customersList()
            .then((customerList)=>{
                let options = {
                    method: 'GET',
                    qs: customerList,
                    uri: config.orderServiceListUrl,
                    json: true // Automatically stringifies the body to JSON
                }
                return requestPromise(options)
            })
            .then((customersOrdersList)=>{
                // console.log("customersOrdersList",JSON.stringify(customersOrdersList));
                if(customersOrdersList && customersOrdersList.status ==="SUCCESS"){
                    response['status'] = "SUCCESS";
                    response['data']['cusotmerOrders'] = customersOrdersList.data.orders;
                    response['data']['message'] = "Customers Order Information";
                } else{
                    response['data']['message'] = "Customers doen't have Order Information";
                }
                resolve(response)
            })
    })
}
CustomerAction.prototype.customerOrder = function (input){
    let response ={
        status:"FAILURE",
        err :{},
        data:{}
    };
    return new Promise((resolve,reject)=>{
        this.customerServiceInstance.customerDetails(input)
            .then((result)=>{
                // let inputData ={
                //     customerId:result.customerId,
                //     email:result.email
                // }
                input.customerId = result.customerId
                let options = {
                    method: 'GET',
                    qs: input,
                    uri: config.customerOrderUrl,
                    json: true // Automatically stringifies the body to JSON
                }
                return requestPromise(options)
            })
            .then((resule)=>{
                console.log("resule",resule)
                if(resule && resule.status ==="SUCCESS"){
                    response['status'] = "SUCCESS"
                    response['data']['customerName'] = input.customerName;
                    response['data']['orders'] = resule.data.orders;
                    response['data']['message'] = resule.data.message
                }
                else{
                    response['data']['message'] = "Error in Customer Order"
                    }
                resolve(response)
            })
            .catch((err) => {
                console.log(err,"err");
                reject(err);
            })
    })
}



module.exports = CustomerAction;