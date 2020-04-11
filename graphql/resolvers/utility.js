const Event = require('../../model/event');
const User = require('../../model/user');

const { dateToString } = require('../../helpers/date');


const events = async (eventIds) => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return {
                ...event._doc,
                date: dateToString(event._doc.date),
                creator: user.bind(this, event.creator)
            }
        });
    } catch (error) {
        throw error;
    }
}

const singleEvent = async (eventId) => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc,
            date: dateToString(event._doc.date),
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
        throw error;
    }
}

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event._doc._id.toString(),
        creator: user.bind(this, event._doc.creator),
        date: dateToString(event._doc.date),
    }
}

const transformBooking = booking => {
    return {
        ...booking._doc,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    }
}

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;