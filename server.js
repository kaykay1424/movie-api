// Modules
const fs = require('fs'),
http = require('http');

const port = 8080;

http.createServer((request,response) => {
    const address = new URL(`localhost:${port}${request.url}`);
    let filePath;
    // Set filePath based on URL requested by user
    address.pathname.includes('documentation')    
    ?  filePath = `${__dirname}/documentation.html`
    : filePath = `${__dirname}/index.html`;
    // Show file to user
    fs.readFile(filePath, (error, content) => {
        response.writeHead(200, {'Content-type': 'text/html'});
        response.write(content);
        response.end();
    });
    // Log URL requested and timestamp of request to log.txt
    fs.appendFile(`${__dirname}/log.txt`, `URL: ${address} \n Timestamp: ${new Date()}`, (error) => {});    
}).listen(port);
