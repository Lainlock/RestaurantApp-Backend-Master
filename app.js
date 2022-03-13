const config = require('config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet')
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {swaggerOptions: {defaultModelsExpandDepth: -1},};
const options = {
  swaggerDefinition,
  apis: ['./routes/auth.js', './routes/reservations.js', './routes/tables.js', './routes/menu.js']
};
const swaggerSpec = swaggerJSDoc(options);

const auth = require('./routes/auth');
const users = require('./routes/users');
const tables = require('./routes/tables');
const menu = require('./routes/menu');
const reservations = require('./routes/reservations');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(helmet())
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/menu', menu);
app.use('/api/reservations', reservations);
app.use('/api/tables', tables);
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);


mongoose.connect(config.get('db'))
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
