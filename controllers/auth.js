const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require("../errors")
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        throw new BadRequestError('Please provide name, email and password');
        // return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Please provide name, email and password' });
    }
    // check if user exists
    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //     throw new BadRequestError('Email already in use');
    // }
    // create user
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password });
    console.log(user);
    // const jvmToken = jwt.sign({ userId: user._id, name: user.name }, process.env.JVM_SECRET, { expiresIn: '1d' });
    // console.log(jvmToken);
    res.status(StatusCodes.CREATED).json({  
        user: { 
            name: user.name,
        },       
        token: user.createJWT(), 
    });
}
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError('Please provide email and password');
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new BadRequestError('Invalid Credentials');
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
        throw new UnauthenticatedError('Invalid Credentials');
    }
    res.status(StatusCodes.OK).json({ user: { name: user.name }, token: user.createJWT() });
}

module.exports = {
    register,
    login,
};  