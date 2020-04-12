const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../model/user');

module.exports = {
    createUser: async (args) => {
        try {
            const exitstingUser = await User.findOne({ email: args.userInput.email });
            if (exitstingUser) {
                throw new Error('Email already exists');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const newUser = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const user = await newUser.save();
            console.log(user);
            return { ...user._doc, _id: user.id, password: null };
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    login: async ({ email, password }) => {
        const user = await User.findOne({ email: email });
        if (!user)
            throw new Error("User with that email not found");
        const matchedPassword = await bcrypt.compare(password, user.password);
        if (!matchedPassword)
            throw new Error("Password is incorrect");

        const token = jwt.sign({ userId: user._id, email: user.email }, 'supersecret', { expiresIn: '2h' });
        return { userId: user._id, token: token, tokenExpiration: 2 };
    }
}