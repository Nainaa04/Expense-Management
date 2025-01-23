const transactionModel=require("../models/transactionModel");
const moment=require('moment');

const getAllTransaction = async (req, res) => {
    try {
        const { frequency, selectedDate, userid, type } = req.body; // Destructure `selectedDate` and `userid`

        const query = {
            userid,
            ...(frequency !== 'custom'
                ? {
                    date: {
                        $gt: moment().subtract(Number(frequency), "d").toDate(),
                    },
                }
                : selectedDate && selectedDate.length === 2
                ? {
                    date: {
                        $gte: new Date(selectedDate[0]), // Start date
                        $lte: new Date(selectedDate[1]), // End date
                    },
                }
                : {}),
                
        };
        if(type!=='all'){
            query.type=type;
        }
        console.log("Query sent to DB:", query);

        const transactions = await transactionModel.find(query);
        res.status(200).json(transactions);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

const deleteTransaction=async(req,res)=>{
    try{
        await transactionModel.findOneAndDelete({_id:req.body.transactionId})
        res.status(200).send('Tranaction Deleted Successfully')
    }catch(error){
        console.log(error)
        res.status(500).json(error);
    }
}

const editTransaction =async(req,res)=>{
    try{
        await transactionModel.findOneAndUpdate(
            {_id:req.body.transactionId},
            req.body.payload
        );
        res.status(200).send("Edit Successfully");
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

const addTransaction=async(req,res)=>{
    try{
        const newTransaction=new transactionModel(req.body);
        await newTransaction.save();
        res.status(201).send("Transaction Created");
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

 

//routes

module.exports={getAllTransaction,addTransaction,editTransaction,deleteTransaction}