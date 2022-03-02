const http = require('http');

const requestListener = (req, res) => {
  switch (req.method) {
    case 'POST':
      switch (req.url) {
        case '/new-pr':
          console.log(req.body);
      }
  }

  res.writeHead(200);
  res.end('Hello, World!');
}

const server = http.createServer(requestListener);
server.listen(8080);
