const express= require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "Aryanisagoodb$oy";

//Create a user using : POST "/api/auth/createUser" . no login required
router.post('/createuser',[
    body('name','Enter a valid Name ').isLength({ min: 3 }),
    body('email','Enter a valid Email').isEmail(),
    body('password','Password must be atleast 5 characters').isLength({ min: 6 })
],async (req,res)=>{
    //if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    //check whether the user with this email exists already
    try{
    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.status(400).json({error: "Sorry the user with this email already exists"})
    }
    const salt = await bcrypt.genSalt(10);
    const scrPass = await bcrypt.hash(req.body.password, salt)
    //create a new user
    user = await User.create({
        name: req.body.name,
        password: scrPass,
        email:req.body.email,
    })
    const data = {
        user:{
            id: user.id
        }
    }
    const authToken = jwt.sign(data,JWT_SECRET)
    console.log(authToken);

    // res.json(user);
    res.json({authToken})
    }catch(error){
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

module.exports = router;