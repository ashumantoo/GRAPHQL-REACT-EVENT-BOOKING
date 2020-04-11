const bcrypt = require('bcrypt');

const Event = require('../../model/event');
const User = require('../../model/user');
const Booking = require('../../model/booking');

const events = async (eventIds) => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return {
                ...event._doc,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const singleEvent = async (eventId) => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc,
            date: new Date(event._doc.date).toISOString(),
            creator: user.bind(this, event.creator)
        }
    } catch (error) {
        throw error;
    }
}

const user = async (userId) => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            password: null,
            createdEvents: events.bind(this, user.createdEvents)
        };
    } catch (error) {
        console.log(error);
        throw error;
    }

}

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return {
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                }
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                }
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
            console.log(event);
            createdEvent = {
                ...event._doc,
                _id: event._doc._id.toString(),
                creator: user.bind(this, event._doc.creator),
                date: new Date(event._doc.date).toISOString(),
            }
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
    },
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
    bookEvent: async (args) => {
        try {
            const fetchedEvent = await Event.findOne({ _id: args.eventId });
            const booking = new Booking({
                user: "5e915fcb4bdb2d34bb3250d6",
                event: fetchedEvent
            });

            const result = await booking.save();
            return {
                ...result._doc,
                user: user.bind(this, result._doc.user),
                event: singleEvent.bind(this, result._doc.event),
                createdAt: new Date(result._doc.createdAt).toISOString(),
                updatedAt: new Date(result._doc.updatedAt).toISOString()
            }

        } catch (error) {
            throw error;
        }
    },

    cancelBooking: async (args) => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = {
                ...booking.event._doc,
                creator: user.bind(this, booking.event._doc.creator)
            }
            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (error) {
            throw error;
        }
    }
}






/*
======================================================= Promise based code =============================================
const events = eventIds => {
    return Event.find({ _id: { $in: eventIds } })
        .then(events => {
            return events.map(event => {
                return {
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event.creator)
                }
            });
        })
        .catch(error => {
            console.log(error);
            throw error;
        });
}

const user = (userId) => {
    return User.findById(userId)
        .then(user => {
            return {
                ...user._doc,
                password: null,
                createdEvents: events.bind(this, user.createdEvents)
            };
        })
        .catch(error => {
            console.log(error);
            throw error;
        });
}

module.exports = {
    events: () => {
        //this return will ensure that some asynchronous task is running, only return after the finishing
        //of the asynchronous task
        return Event.find()
            .then(events => {
                return events.map(event => {
                    //in event.id, this id is created by graphql for query operation,somewhat it is similar to the _id of the mongodb
                    return {
                        ...event._doc,
                        date: new Date(event._doc.date).toISOString(),
                        creator: user.bind(this, event._doc.creator)
                    }
                });
            }).catch(error => {
                console.log(error);
                throw error;
            });
    },
    createEvent: (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: "5e915fcb4bdb2d34bb3250d6"
        });
        let createdEvent;
        //this return will ensure that some asynchronous task is running, only return after the finishing
        //of the asynchronous task
        return event.save().then(event => {
            console.log(event);
            //mongodb _id is somehow not understandable by graphql,so it need to be converted into String
            createdEvent = {
                ...event._doc,
                _id: event._doc._id.toString(),
                creator: user.bind(this, event._doc.creator),
                date: new Date(event._doc.date).toISOString(),
            }
            return User.findById("5e915fcb4bdb2d34bb3250d6");
        }).then(user => {
            if (!user) {
                throw new Error("User not found");
            }
            //below code is similar to user.createEvents.push(createdEvent._id)
            //mongoose will able to pull out _id from the event object becasue in our user schema we are
            //only storing the createdEvent Id
            user.createdEvents.push(event);
            return user.save();
        }).then(resutl => {
            return createdEvent;
        }).catch(error => {
            console.log(error);
            throw error;
        });
    },
    createUser: (args) => {
        return User.findOne({ email: args.userInput.email }).then(user => {
            if (user) {
                throw new Error('Email already exists');
            }
            return bcrypt.hash(args.userInput.password, 12);
        }).then(hashedPassword => {
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            // user.save().then().catch();
            return user.save();
        }).then(user => {
            console.log(user);
            return { ...user._doc, _id: user.id, password: null };
        }).catch(err => {
            console.log(err);
            throw err;
        });
    }
}*/