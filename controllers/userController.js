const userModel=require('../models/userModel')


const loginController=async(req,res)=>{
    try{
        const {email,password}=req.body
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
              });
        }
        if (user.password !== password) {
            return res.status(401).json({
              success: false,
              message: "Incorrect password",
            });
          }
        res.status(200).json({
            success:true,
            message:'Login Successfull',
            user,
        });
    }catch(error){
        res.status(400).json({
            success:false,
            error
        })
    }
}


const registerController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
        const newUser = new userModel(req.body);
        await newUser.save(); // Ensure this executes without error
        res.status(201).json({
            success: true,
            newUser,
        });
    } catch (error) {
        console.error("Error in registerController:", error); // Log the error
        res.status(400).json({
            success: false,
            error,
        });
    }
};



module.exports={ loginController,registerController};