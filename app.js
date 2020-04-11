const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { buildSchema } = require('graphql');

const Event = require('./model/event');
const User = require('./model/user');

const app = express();

const PORT = process.env.PORT || 8002;
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@firstcluster-1gkcp.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    //graphql schema for different query and mutation
    schema: buildSchema(`
        type Event {
            _id:ID!
            title:String!
            description:String! 
            price:Float!
            date:String!
        }

        type User {
            _id:ID!
            email:String!
            password:String
        }

        input EventInput {
            title:String!
            description:String! 
            price:Float!
            date:String!
        }

        input UserInput {
            email:String!
            password:String!
        }

        type RootQuery {
            events : [Event!]!
        }

        type RootMutation {
            createEvent(eventInput:EventInput):Event
            createUser(userInput:UserInput):User
        }

        schema {
            query:RootQuery
            mutation:RootMutation
        }
    `),
    rootValue: {
        //Resolver of the query and mutation
        events: () => {
            //this return will ensure that some asynchronous task is running, only return after the finishing
            //of the asynchronous task
            return Event.find().then(events => {
                return events.map(event => {
                    return { ...event._doc, _id: event.id } //in event.id, this id is created by graphql for query operation,
                    // somewhat it is similar to the _id of the mongodb 
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
                createdEvent = { ...event._doc, _id: event._doc._id.toString() }
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
    },
    graphiql: true
}));

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(result => {
    //if mongodb connect successfully then only start the server
    console.log('MongoDB connected successfully');
    app.listen(PORT, (error) => {
        if (!error)
            console.log('Server up and running on port ' + PORT);
        else
            console.log(error);
    });
}).catch(error => {
    console.log(error);
});