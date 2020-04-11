const bcrypt = require('bcrypt');
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
    }
}