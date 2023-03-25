const mongoose=require("mongoose")
// mongoose.connect("mongodb://127.0.0.1:27017/MINIPROJECT")
require('dotenv').config();
mongoose.set('strictQuery', false);
const express=require("express")
const app=express()
 
DB=process.env.DBURL
mongoose.connect(DB)

const connection=mongoose.connection;

connection.once('open',()=>{
    console.log('connection is successfull');
})

app.use(express.static('public'))
app.use(express.static('./public/admin'))

//for user route
const userRoute=require("./routes/userRoute")
app.use('/',userRoute)

// for admin route
const adminRoute=require('./routes/adminRoute')
app.use('/admin',adminRoute);


app.get('*',function(req,res){
    res.status(404).render('404.ejs')
})

app.listen(3000,function(){
    console.log("server running")
})