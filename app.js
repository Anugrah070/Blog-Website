

require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const cookieParser=require("cookie-parser");
const expressLayout=require('express-ejs-layouts');
const methodOverride=require('method-override');
const connectDB=require('./server/config/db');
const session = require('express-session');
const MongoStore=require('connect-mongo');

const app=express();
const PORT=3000||process.env.PORT;



//CONNECTION TO DATABASE

connectDB();


app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true,
    store:MongoStore.create({
        mongoUrl:process.env.mongodb_URI
    })
}))

//Template engine
app.use(expressLayout);
app.set('layout','./layouts/main.ejs');
app.set('view engine','ejs');


app.use('/', require('./server/routes/main'));
app.use('/',require('./server/routes/admin'));


app.listen(PORT,()=>{
    console.log(`listening to the port ${PORT}`)
});



