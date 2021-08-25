class ParsedURL {
  constructor(url) {
    this.schema = "http";
    this.host = "localhost";
    this.port = 80;
    this.path = "/";
    const regexp = /(https?):\/\/([^\/:]+):?(\d*)(\/?.*)/;
    const match = url.match(regexp);
    if (match) {
      this.schema = match[1];
      this.host = match[2];
      this.port =
        match[3].length > 0
          ? +match[3]
          : (() => {
              if (this.schema == "https") return 443;
              return 80;
            })();
      this.path = match[4];
    }
  }
}

const metadata = {
  name: "NodeJS + HTTP",
  fileExtension: "js",
  identifier: "com.proxyman.plugin.nodeJSHTTPGenerator",
  author: "Paw and Proxyman",
  version: "1.0.0"
};

exports.generate = (request) => {
  const headers = request.headers;
  for (var key in headers) {
    const value = headers[key]
    if (typeof value == 'string') {
      headers[key] = value.trim();
    } else {
      headers[key] = value;
    }
  }
  const method = request.method.toUpperCase();
  const parsedUrl = new ParsedURL(request.url);
  const body = request.jsonBody || request.urlEncodedBody || undefined;

  return `/**
  Proxyman Code Generator (${metadata.version}): NodeJS + Fetch
  ${request.method.toUpperCase()} ${parsedUrl.host}/${parsedUrl.path}
  */
(function(callback) {
    'use strict';
        
    const httpTransport = require('${parsedUrl.schema}');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: '${parsedUrl.host}',
        port: '${parsedUrl.port}',
        path: '${parsedUrl.path}',
        method: '${method}',
        headers: ${JSON.stringify(headers)}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;
 
${
  (request.httpBasicAuth
    ? "    // Using Basic Auth " + JSON.stringify(request.httpBasicAuth) + "\n"
    : "") +
  (request.followRedirects
    ? "    // Paw Follow Redirects option is not supported\n"
    : "") +
  (request.storeCookies
    ? "    // Paw Store Cookies option is not supported\n"
    : "")
}
    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';
        
        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;            
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ? 
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
            
            callback(null, res.statusCode, res.headers, responseStr);
        });
        
    })
    .on('error', (error) => {
        callback(error);
    });
${
  body !== undefined
    ? "    request.write(" + JSON.stringify(body) + ");"
    : ""
}    
    request.end();
    
})((error, statusCode, headers, body) => {
    console.log('ERROR:', error); 
    console.log('STATUS:', statusCode);
    console.log('HEADERS:', JSON.stringify(headers));
    console.log('BODY:', body);
});
`;
};