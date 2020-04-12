const Event = require('../../model/event');
const Booking = require('../../model/booking');
const { transformBooking, transformEvent } = require('./utility');

module.exports = {
    bookings: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Not Authenticated');
        }
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return transformBooking(booking);
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    bookEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Not Authenticated');
        }
        try {
            const fetchedEvent = await Event.findOne({ _id: args.eventId });
            const booking = new Booking({
                user: "5e915fcb4bdb2d34bb3250d6",
                event: fetchedEvent
            });

            const result = await booking.save();
            return transformBooking(result);

        } catch (error) {
            throw error;
        }
    },

    cancelBooking: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Not Authenticated');
        }
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(booking.event);
            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (error) {
            throw error;
        }
    }
}