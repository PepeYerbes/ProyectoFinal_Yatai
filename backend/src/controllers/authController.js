import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import errorHandler from '../middlewares/errorHandler.js';


const generateToken = (userId, displayName, role) => {
    return jwt.sign({ userId, displayName, role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' })
}

const generatePasswor = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

const checkUserExists = async (email) => {
    const user = await User.findOne({ email });
    return user;
}

async function register(req, res, next) {
    try {
        const { displayName, email, password } = req.body;
        const userExists = await checkUserExists(email);
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (!displayName || !email || !password) {
            return res.status(400).json({ message: "Display name, email and password are required" });
        }
        let role = 'guest';
        const hashpassword = await bcrypt.hash (password,10);
        const newUser = new User({
            displayName,
            email,
            hashpassword,
            role,
        });
        await newUser.save();
        res.status(201).json({ displayName, email, password: hashpassword, role });        
    } catch (error) {
        next(error);
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const userExist = await checkUserExists(email);
        if (!userExist) {
            return res.status(404).json({ message: "User does not exist. You must to sing in" });
        }
        const isMatch = await bcrypt.compare(password, userExist.hashpassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = generateToken(userExist._id, userExist.displayName, userExist.role);
        res.status(200).json({token});
    } catch (error) {
        next(error);
    }
}

export { register, login };