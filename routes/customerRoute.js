const customerAction = require('../actions/customerAction')

const CustomerRoute = function (app){
    this.app = app;
    this.customerActionInstance = new customerAction(app);
}

CustomerRoute.prototype.init = function () {

    this.app.get("/", (req, res) => {
        res.send({"test":"OK"});
    })

    this.app.post('/registration',  (req,res) => {
        console.log(new Date(),`Input for customer Registration`,req.body)
        return this.customerActionInstance.registration(req.body)
            .then( (response) => {
                console.log(new Date(),`Response for Customer Registration`,response);
                res.send(response);
            })
            .catch((e)=> {
                console.log(`Error in Customer Registration`,e);
                res.send(e.message);
            });
    });

    this.app.get('/login',  (req, res) =>{
        console.log(new Date,`INPUT FOR THE LOGIN`,req.query);
        return this.customerActionInstance.login(req.query)
            .then(function (response) {
                console.log(new Date(),`Response for LOGIN`,response);
                res.send(response);
            })
            .catch(function (e) {
                console.log(`Error in Customer LOGIN`,e);
                res.send(e.message);
            });
    });

    this.app.post("/order/creation",(req,res)=>{
        let input = req.body;
        input.token = req.headers.authorization;
        console.log(new Date,`INPUT FOR ORDER CREATION`,input);
        return this.customerActionInstance.orderCreation(input)
            .then((response)=>{
                console.log(`Response for Order Creation`,response)
                res.send(response)
            })
            .catch((e)=>{
                console.log(`Error In Order Creation`)
                res.send(e)
            })
    })

    this.app.put("/order/cancellation",(req,res)=>{

        let input = req.body;
        input.token = req.headers.authorization;
        console.log(new Date,`INPUT FOR ORDER CANCELLATION`,input);
        this.customerActionInstance.orderCancellation(input)
            .then((response)=>{
                console.log(`Response for Order Cancellation`,response)
                res.send(response)
            })
            .catch((e)=>{
                console.log(`Error In Order Cancellation`);
                res.send(e)
            })

    })

    this.app.put("/order/updation",(req,res)=>{
        let input = req.body;
        input.token = req.headers.authorization;
        console.log(new Date(),`Input for Order Updation`,input);
        return this.customerActionInstance.orderUpdation(input)
            .then((response)=>{
                console.log(`Response for Order Updation`,response)
                res.send(response)
            })
            .catch((e)=>{
                console.log(`Error In Order Updation`);
                res.send(e)
            })
    })

    //Api to list customers based on the number of product purchased

    this.app.get("/customers/order",(req,res)=>{
        console.log(new Date(),`INPUT FOR CUSTOMER PURCHASE ORDER`,req.query)
        return this.customerActionInstance.customerInformation()
            .then((response)=>{
                console.log(`Response for Customers Order`,response)
                res.send(response)
            })
            .catch((e)=>{
                console.log(`Error In Customers Order`);
                res.send(e)
            })

    })

   // Create an API to list purchased Product based on Customer
    this.app.get("/customer/order",(req,res)=>{
        console.log(new Date(),`INPUT FOR CUSTOMER PURCHASE ORDER`,req.query)
        return this.customerActionInstance.customerOrder(req.query)
            .then((response)=>{
                console.log(`Response for Customer Order`,response)
                res.send(response)
            })
            .catch((e)=>{
                console.log(`Error In Customer Order`);
                res.send(e)
            })
    })
}

module.exports = CustomerRoute;