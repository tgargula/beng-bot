const http = require('http');

const requestListener = (req, res) => {
  console.log(req.body);

  res.writeHead(200);
  res.end('Hello, World!');
}

const server = http.createServer(requestListener);
server.listen(8080);
