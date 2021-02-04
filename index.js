const express = require('express');
const bodyParser = require('body-parser');
const app =express()
app.use(bodyParser.json());
let config = require('./conf');



const customerRoute = require('./routes/customerRoute')
const customerRouteInstance = new customerRoute(app);
customerRouteInstance.init();

app.listen(config.api.port, ()=>{
    console.log(new Date(),`Server is Listening on Port: ${config.api.port}`)
})