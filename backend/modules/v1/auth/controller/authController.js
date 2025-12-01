import UserModel from "../../../../database/models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409).json({ message: 'User is already exist, you can login'});
        }
        const userModel = new UserModel({ name, email, password });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        res.status(200).json({ message: "Signup successfully" })
    } catch (err) {
        res.status(500).json({ message: "Internal server error"})
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        const errorMsg = 'Auth failed email or password is wrong';
        if (!user) {
            return res.status(403).json({ message: errorMsg});
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({ message: errorMsg, success: false });
        }
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.status(200).json({message: "Login Success",
                jwtToken,
                email,
                name: user.name
            })
    } catch (err) {
        res.status(500).json({ message: "Internal server errror" })
    }
}

export default {signup, login};