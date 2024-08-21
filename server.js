const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({path:'./config.env'})
const app = require('./app');

const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then((con) => {
    console.log('DB CONNECTION SUCCESSFUL');
  });


 
 

//SERVER
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});


