const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

const PORT = process.env.PORT || 8002;

app.use(bodyParser.json());

const events = [];

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
            // return ['Cooking', 'Coding', 'Playing', 'Watching TV'];
            return events;
        },
        createEvent: (args) => {
            const event = {
                _id: Math.random().toString(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: args.eventInput.date
            }
            events.push(event);
            return event;
        }
    },
    graphiql: true
}));

app.listen(PORT, (error) => {
    if (error)
        console.log(error);
    else
        console.log('Server up and running on port ' + PORT);
});