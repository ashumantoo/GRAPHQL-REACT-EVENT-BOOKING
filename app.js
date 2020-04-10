const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

const PORT = process.env.PORT || 8002;

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    //graphql schema for different query and mutation
    schema: buildSchema(`
        type RootQuery {
            events : [String!]!
        }

        type RootMutation {
            createEvent(name:String!):String
        }

        schema {
            query:RootQuery
            mutation:RootMutation
        }
    `),
    rootValue: {
        //Resolver of the query and mutation
        events: () => {
            return ['Cooking', 'Coding', 'Playing', 'Watching TV'];
        },
        createEvent: (args) => {
            const eventName = args.name;
            return eventName;
        }
    },
    graphiql: true
}))

// app.get('/', (req, res) => {
//     res.send('Hello World!');
// })

app.listen(PORT, (error) => {
    if (error)
        console.log(error);
    else
        console.log('Server up and running on port ' + PORT);
});