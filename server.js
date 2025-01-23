const express=require('express');
const cors=require('cors');
const morgan=require('morgan');
const dotenv=require('dotenv');
const colors=require('colors');
const connectDb = require('./config/connectDb');


const app=express();

//config env file
dotenv.config();

//calling database
connectDb();
//middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

//routes
app.use("/api/v1/users",require("./routes/userRoute"))
//transaction routes
app.use('/api/v1/transactions',require("./routes/transactionRoutes"));

 
//port initialisation
const PORT= 8080 || process.env.PORT ;
app.listen(PORT,()=>{
    console.log(`server running or Port ${PORT}`);
});