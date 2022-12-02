const http = require('http');
const { URL } = require('url');

const routes = require('./routes');
const bodyParser = require('./helpers/bodyParser');

const server = http.createServer((request, response) => {

  const parsedUrl = new URL(`http://localhost:8080${request.url}`);

  let { pathname } = parsedUrl;

  let id = null;

  const splitEndpoint = pathname.split('/').filter(Boolean);

  if (splitEndpoint.length > 1) {
    pathname = `/${splitEndpoint[0]}/:id`;
    id = splitEndpoint[1];
  }

  const route = routes.find((routeObj) => (
    routeObj.endpoint === pathname && routeObj.method === request.method
  ));

  response.send = (statusCode, body) => {
    response.writeHead(statusCode, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(body));
  };

  if (route) {
    request.query = Object.fromEntries(parsedUrl.searchParams);
    request.params = { id };

    if (['POST','PUT','PATCH'].includes(request.method)) {
      bodyParser(request, () => {
        route.handler(request, response);
      });
    } else {
      route.handler(request, response);
    }

  } else {

    response.send(404, {message: `Cannot ${request.method} ${parsedUrl.pathname}`});

  }

});

server.listen(8080, () => {
  console.log('Server running at http://localhost:8080/') 
});