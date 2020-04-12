const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const app = express();

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolver = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const PORT = process.env.PORT || 8002;
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@firstcluster-1gkcp.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

app.use(bodyParser.json());

//checking the user Authentication for every request before request hitting to the graphql api
app.use(isAuth);

app.use('/graphql', graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolver,
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