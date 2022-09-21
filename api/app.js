const { port, initApp } = require('./utils/setup.js');
const poker = require('./poker/route.js');

const app = initApp(__dirname);

app.listen(port, () => {
  console.log('Server Started on Port:' + port);
});

poker(app, __dirname);
