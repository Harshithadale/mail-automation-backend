import myusers from "../Models/Myusers.js";
export const add=async(req,res)=>{
    const{email}=req.body;
    try {
        const user=await myusers.findOne({email})
        if(user) return res.status(400).json({message:"User Exists"})
        const newuser=new myusers(
          {email}
        )
        await newuser.save()
        return res.status(201).json(newuser)
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
}