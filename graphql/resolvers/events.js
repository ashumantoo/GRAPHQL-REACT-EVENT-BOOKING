const Event = require('../../model/event');
const User = require('../../model/user');
const { transformEvent } = require('./utility');

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return transformEvent(event);
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    createEvent: async (args) => {
        const newEvent = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: "5e91b624eb605b4ceaa04f10"
        });
        let createdEvent;
        try {
            const event = await newEvent.save();
            createdEvent = transformEvent(event);
            const creator = await User.findById("5e91b624eb605b4ceaa04f10");
            if (!creator) {
                throw new Error("User not found");
            }
            creator.createdEvents.push(event);
            await creator.save();
            return createdEvent;
        }
        catch (error) {

        }
    }
}