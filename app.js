const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const { buildSchema } = require('graphql');

const Event = require('./model/event');

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

        input EventInput {
            title:String!
            description:String! 
            price:Float!
            date:String!
        }

        type RootQuery {
            events : [Event!]!
        }

        type RootMutation {
            createEvent(eventInput:EventInput):Event
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
                })
            }).catch(error => {
                console.log(error);
                throw error;
            });
            return events;
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });

            //this return will ensure that some asynchronous task is running, only return after the finishing
            //of the asynchronous task
            return event.save().then(event => {
                console.log(event);
                //mongodb _id is somehow not understandable by graphql,so it need to be converted into String 
                return { ...event._doc, _id: event._doc._id.toString() }
            }).catch(error => {
                console.log(error);
                throw error;
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