const CodeGenerator = require("./src/code-generator");
const fs = require('fs');

const requestFactory = (type) => {
  switch (type) {
    case "PostWithJSONBody":
      const body = {
        Name: "Proxyman",
        Country: "Singapore",
      };

      return {
        method: "POST",
        url: "https://proxyman.io/get?data=123",
        _headers: [
          ["Host", "proxyman.io"],
          ["Content-Type", "application/json"],
          ["Content-Length", 123],
          ["Acceptance", "json"],
        ],
        jsonBody: body,
      };
      break;
    default:
      return undefined;
  }
};

const expectEqualWithoutFormat = (expected, received) => {
  // Compare two string without evaluating the space/tab format
  expect(expected.replace(/\s/g, "")).toEqual(received.replace(/\s/g, ""));
};

test("Swift Alamofire should work", () => {
  const request = requestFactory("PostWithJSONBody");
  const output = CodeGenerator.convert(request, "swift-alamofire");
  let expected = `import Alamofire
    
  func sendRequest() {
    /**
     Proxyman Code Generator (1.0.0): Swift + Alamofire 5
     POST https://proxyman.io/get
     */
  
    // Add Headers
    let headers: HTTPHeaders = [
        "Host": "proxyman.io",
        "Content-Type": "application/json",
        "Content-Length": "123",
        "Acceptance": "json",
    ]
  
    // JSON Body
    let body: [String : Any] = [
          "Name": "Proxyman",
          "Country": "Singapore"
      ]
  
    // Fetch Request
    AF.request("https://proxyman.io/get?data=123", method: .post, parameters: body, encoding: JSONEncoding.default, headers: headers)
        .validate()
        .responseJSON { response in
          debugPrint(response)
        }
  }`;
  expectEqualWithoutFormat(expected, output);
});

test("Swift URLSession should work", () => {
  const request = requestFactory("PostWithJSONBody");
  const output = CodeGenerator.convert(request, "swift-urlsession");
  let expected = `class MyRequestController {
    func sendRequest() {
      /**
       Proxyman Code Generator (1.0.0): Swift + URLSession
       POST https://proxyman.io/get
       */
  
        /* Configure session, choose between:
           * defaultSessionConfiguration
           * ephemeralSessionConfiguration
           * backgroundSessionConfigurationWithIdentifier:
         And set session-wide properties, such as: HTTPAdditionalHeaders,
         HTTPCookieAcceptPolicy, requestCachePolicy or timeoutIntervalForRequest.
         */
        let sessionConfig = URLSessionConfiguration.default
  
        /* Create session, and optionally set a URLSessionDelegate. */
        let session = URLSession(configuration: sessionConfig, delegate: nil, delegateQueue: nil)
  
        /* Create the Request:
            (POST https://proxyman.io/get)
         */
  
        guard var URL = URL(string: "https://proxyman.io/get") else {return}
        let URLParams = [
            "data": "123",
        ]
        URL = URL.appendingQueryParameters(URLParams)
        var request = URLRequest(url: URL)
        request.httpMethod = "POST"
  
        // Headers
  
        request.addValue("proxyman.io", forHTTPHeaderField: "Host")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue("123", forHTTPHeaderField: "Content-Length")
        request.addValue("json", forHTTPHeaderField: "Acceptance")
  
        // JSON Body
  
        let bodyObject: [String : Any] = [
              "Name": "Proxyman",
              "Country": "Singapore"
          ]
        request.httpBody = try! JSONSerialization.data(withJSONObject: bodyObject, options: [])
  
        /* Start a new Task */
        let task = session.dataTask(with: request, completionHandler: { (data: Data?, response: URLResponse?, error: Error?) -> Void in
            if (error == nil) {
                // Success
                let statusCode = (response as! HTTPURLResponse).statusCode
                print("URL Session Task Succeeded: HTTP (statusCode)")
            }
            else {
                // Failure
                print("URL Session Task Failed: %@", error!.localizedDescription);
            }
        })
        task.resume()
        session.finishTasksAndInvalidate()
    }
  }
  
  
  protocol URLQueryParameterStringConvertible {
    var queryParameters: String {get}
  }
  
  extension Dictionary : URLQueryParameterStringConvertible {
    /**
     This computed property returns a query parameters string from the given NSDictionary. For
     example, if the input is @{@"day":@"Tuesday", @"month":@"January"}, the output
     string will be @"day=Tuesday&month=January".
     @return The computed parameters string.
    */
    var queryParameters: String {
        var parts: [String] = []
        for (key, value) in self {
            let part = String(format: "%@=%@",
                String(describing: key).addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!,
                String(describing: value).addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!)
            parts.append(part as String)
        }
        return parts.joined(separator: "&")
    }
    
  }
  
  extension URL {
    /**
     Creates a new URL by adding the given query parameters.
     @param parametersDictionary The query parameter dictionary to add.
     @return A new URL.
    */
    func appendingQueryParameters(_ parametersDictionary : Dictionary<String, String>) -> URL {
        let URLString : String = String(format: "%@?%@", self.absoluteString, parametersDictionary.queryParameters)
        return URL(string: URLString)!
    }
  }`;
  expectEqualWithoutFormat(expected, output);
});

test("Swift Moya should work", () => {
  const request = requestFactory("PostWithJSONBody");
  const output = CodeGenerator.convert(request, "swift-moya");
  let expected = `import Moya
    
  /**
   Proxyman Code Generator (1.0.0): Swift + Moya
   POST proxyman.io
   */
  
  public enum API {
      case makeRequest(data: Int)
  }
  
  extension API: TargetType {
  
      public var baseURL: URL { return URL(string: "https://proxyman.io")! }
  
      public var path: String {
          switch self {
          case .makeRequest:
              return "/get"
          }
      }
  
      public var method: Moya.Method {
          switch self {
          case .makeRequest:
              return .post
          }
      }
  
      public var task: Task {
          switch self {
          case .makeRequest(let data):
              return .requestParameters(parameters: ["data": data], encoding: URLEncoding.default)
          case .makeRequest(let Name, let Country):
              return .requestParameters(parameters: ["Name": Name, "Country": Country], encoding: URLEncoding.default)
          }
      }
  
      public var headers: [String: String]? {
          return ["Host" : "proxyman.io", 
                  "Content-Type" : "application/json", 
                  "Content-Length" : "123", 
                  "Acceptance" : "json"]
      }
  
      public var sampleData: Data {
          switch self {
          case .makeRequest:
              return "{}".data(using: String.Encoding.utf8)!
          }
      }
  }`;
  expectEqualWithoutFormat(expected, output);
});

test("ObjC NSURLSession should work", () => {
  const request = requestFactory("PostWithJSONBody");
  const output = CodeGenerator.convert(request, "objc-nsurlsession");
  let expected = `/**
  Proxyman Code Generator (1.0.0): Objective-C NSURLSession
  POST https://proxyman.io/get
*/

NSURL* URL = [NSURL URLWithString:@"https://proxyman.io/get"];
NSDictionary* URLParams = @{
    @"data": @"123",
};
URL = NSURLByAppendingQueryParameters(URL, URLParams);
NSMutableURLRequest* request = [NSMutableURLRequest requestWithURL:URL];
request.HTTPMethod = @"POST";

// Headers

[request addValue:@"proxyman.io" forHTTPHeaderField:@"Host"];
[request addValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
[request addValue:@"123" forHTTPHeaderField:@"Content-Length"];
[request addValue:@"json" forHTTPHeaderField:@"Acceptance"];

// JSON Body

NSDictionary* bodyObject = @{
    @"Name": @"Proxyman",
    @"Country": @"Singapore"
};
request.HTTPBody = [NSJSONSerialization dataWithJSONObject:bodyObject options:kNilOptions error:NULL];

// Connection

NSURLConnection* connection = [NSURLConnection connectionWithRequest:request delegate:nil];
[connection start];

/*
 * Utils: Add this section before your class implementation
 */

/**
 This creates a new query parameters string from the given NSDictionary. For
 example, if the input is @{@"day":@"Tuesday", @"month":@"January"}, the output
 string will be @"day=Tuesday&month=January".
 @param queryParameters The input dictionary.
 @return The created parameters string.
*/
static NSString* NSStringFromQueryParameters(NSDictionary* queryParameters)
{
    NSMutableArray* parts = [NSMutableArray array];
    [queryParameters enumerateKeysAndObjectsUsingBlock:^(id key, id value, BOOL *stop) {
        NSString *part = [NSString stringWithFormat: @"%@=%@",
            [key stringByAddingPercentEscapesUsingEncoding: NSUTF8StringEncoding],
            [value stringByAddingPercentEscapesUsingEncoding: NSUTF8StringEncoding]
        ];
        [parts addObject:part];
    }];
    return [parts componentsJoinedByString: @"&"];
}

/**
 Creates a new URL by adding the given query parameters.
 @param URL The input URL.
 @param queryParameters The query parameter dictionary to add.
 @return A new NSURL.
*/
static NSURL* NSURLByAppendingQueryParameters(NSURL* URL, NSDictionary* queryParameters)
{
    NSString* URLString = [NSString stringWithFormat:@"%@?%@",
        [URL absoluteString],
        NSStringFromQueryParameters(queryParameters),
    ];
    return [NSURL URLWithString:URLString];
}`;
  expectEqualWithoutFormat(expected, output);
});

test("Axios should work", () => {
  const request = requestFactory("PostWithJSONBody");
  const output = CodeGenerator.convert(request, "axios");
  let expected = `axios({
    "method": "post",
    "params": {
            "data": "123"
    },
    "headers": {
            "Host": "proxyman.io",
            "Content-Type": "application/json",
            "Content-Length": 123,
            "Acceptance": "json"
    },
    "data": {
            "Name": "Proxyman",
            "Country": "Singapore"
    }
})`;
  expectEqualWithoutFormat(expected, output);
});

test("HTTPie should work", () => {
  const request = requestFactory("PostWithJSONBody");
  const output = CodeGenerator.convert(request, "httpie");
  let expected = `http --json POST 'https://proxyman.io/get?data=123' \\
      'Host':'proxyman.io' \\
      'Content-Type':'application/json' \\
      'Content-Length':'123' \\
      'Acceptance':'json' \\
      Name="Proxyman" \\
      Country="Singapore"`;
  expectEqualWithoutFormat(expected, output);
});

test("Go should work", () => {
  const request = requestFactory("PostWithJSONBody");
  const output = CodeGenerator.convert(request, "go");
  let expected = `package main
    
  import (
      "fmt"
      "io/ioutil"
      "net/http"
      "os"
      "bytes"
  )
  
  func send() error {
    // Proxyman Code Generator (1.0.0): Go HTTP
    // POST https://proxyman.io/get
  
      json := []byte(\`{"Name": "Proxyman","Country": "Singapore"}\`)
      body := bytes.NewBuffer(json)
  
  
      // Create request
      req, err := http.NewRequest("POST", "https://proxyman.io/get?data=123", body)
      if err != nil {
              fmt.Fprintln(os.Stderr, err)
              return err
      }
  
      // Headers
      req.Header.Add("Host", "proxyman.io")
      req.Header.Add("Content-Type", "application/json")
      req.Header.Add("Content-Length", "123")
      req.Header.Add("Acceptance", "json")
  
      if err := req.ParseForm(); err != nil {
              fmt.Fprintln(os.Stderr, err)
              return err 
      }
  
      // Fetch Request
      resp, err := http.DefaultClient.Do(req)
      if err != nil {
              fmt.Fprintln(os.Stderr, err)
              return err
      }
      defer resp.Body.Close()
  
      // Read Response Body
      respBody, err := ioutil.ReadAll(resp.Body)
      if err != nil {
              fmt.Fprintln(os.Stderr, err)
              return err
      }
  
      // Display Results
      fmt.Println("response Status : ", resp.Status)
      fmt.Println("response Headers : ", resp.Header)
      fmt.Println("response Body : ", string(respBody))
  
      return nil
  }`;
  expectEqualWithoutFormat(expected, output);
});

test("Java HTTP Apache Fluent should work", () => {
  const request = requestFactory("PostWithJSONBody");
  const output = CodeGenerator.convert(request, "java");
  let expected = `import java.io.IOException;
  import org.apache.http.client.fluent.*;
  import org.apache.http.entity.ContentType;
  
  public class SendRequest
  {
    public static void main(String[] args) {
      sendRequest();
    }
    
    private static void sendRequest() {
      
      //  (POST )
      
      try {
        
        // Create request
        Content content = Request.Post("https://proxyman.io/get?data=123")
        
        // Add headers
        .addHeader("Host", "proxyman.io")
        .addHeader("Content-Type", "application/json")
        .addHeader("Content-Length", "123")
        .addHeader("Acceptance", "json")
        
        // Add body
        .bodyString("{\\"Name\\": \\"Proxyman\\",\\"Country\\": \\"Singapore\\"}", ContentType.APPLICATION_JSON)
        
        // Fetch request and return content
        .execute().returnContent();
        
        // Print content
        System.out.println(content);
      }
      catch (IOException e) { System.out.println(e); }
    }
  }`;
  expectEqualWithoutFormat(expected, output);
});

test("Javascript jQuery should work", () => {
  const request = requestFactory("PostWithJSONBody");
  const output = CodeGenerator.convert(request, "javascript-jquery");
  let expected = `/**
  Proxyman Code Generator (1.0.0): Javascript + jQuery
  POST https://proxyman.io/get
  */
 
 jQuery.ajax({
     url: "https://proxyman.io/get?" + jQuery.param({
         "data": "123",
     }),
     type: "POST",
     headers: {
         "Host": "proxyman.io",
         "Content-Type": "application/json",
         "Content-Length": "123",
         "Acceptance": "json",
     },
     contentType: "application/json",
     data: JSON.stringify({
         "Name": "Proxyman",
         "Country": "Singapore"
     })
 })
 .done(function(data, textStatus, jqXHR) {
     console.log("HTTP Request Succeeded: " + jqXHR.status);
     console.log(data);
 })
 .fail(function(jqXHR, textStatus, errorThrown) {
     console.log("HTTP Request Failed");
 })
 .always(function() {
     /* ... */
 });`;
  expectEqualWithoutFormat(expected, output);
});

test("Node Fetch should work", () => {
  const request = requestFactory("PostWithJSONBody");
  const output = CodeGenerator.convert(request, "node-fetch");
  let expected = `import fetch from 'node-fetch';
    
  /**
   Proxyman Code Generator (1.0.0): NodeJS + Fetch
   POST https://proxyman.io/get
   */
  
  const response = await fetch("https://proxyman.io/get?data=123", {
      method: "post",
      headers: {
          "Host": "proxyman.io",
          "Content-Type": "application/json",
          "Content-Length": "123",
          "Acceptance": "json",
      },
      body: JSON.stringify({
          "Name": "Proxyman",
          "Country": "Singapore"
      })
  })
  const data = await response.json();
  console.log(data);`;

  expectEqualWithoutFormat(expected, output);
});

test("Node HTTP should work", () => {
  const request = requestFactory("PostWithJSONBody");
  const output = CodeGenerator.convert(request, "node-http");
  let expected = `/**
  Proxyman Code Generator (1.0.0): NodeJS + Fetch
  POST proxyman.io//get?data=123
  */
(function(callback) {
    'use strict';
        
    const httpTransport = require('https');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'proxyman.io',
        port: '443',
        path: '/get?data=123',
        method: 'POST',
        headers: {"Host":"proxyman.io","Content-Type":"application/json","Content-Length":123,"Acceptance":"json"}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;
 

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
    request.write({"Name":"Proxyman","Country":"Singapore"});    
    request.end();
    
})((error, statusCode, headers, body) => {
    console.log('ERROR:', error); 
    console.log('STATUS:', statusCode);
    console.log('HEADERS:', JSON.stringify(headers));
    console.log('BODY:', body);
});`;
  expectEqualWithoutFormat(expected, output);
});

test("PostmanCollection2 should work - Sample 1", () => {
  const harFile = fs.readFileSync(__dirname + "/resources/sample.har", "utf8")
  let request = {
    harString: harFile
  }
  const output = CodeGenerator.convert(request, "postmanCollection2");
  let expected = `{"info":{"name":"Proxyman Code Generator: PostmanCollection2","schema":"https://schema.getpostman.com/json/collection/v2.1.0/collection.json"},"item":[{"name":"GET /public-api/users","request":{"method":"GET","url":{"raw":"https://gorest.co.in/public-api/users?first_name=john","protocol":"https","host":"gorest.co.in","path":"/public-api/users","query":[{"value":"john","key":"first_name"}]},"header":[{"key":"Pragma","value":"no-cache"},{"key":"Cache-Control","value":"no-cache"},{"key":"Accept","value":"application/json, text/plain, */*"},{"key":"Sec-Fetch-Dest","value":"empty"},{"key":"Authorization","value":"Bearer GycBk4kyvJYJWcIV33YwdR5yPXi7WeXtKqmY"},{"key":"User-Agent","value":"Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Mobile Safari/537.36"},{"key":"Sec-Fetch-Site","value":"same-origin"},{"key":"Sec-Fetch-Mode","value":"cors"},{"key":"Referer","value":"https://gorest.co.in/rest-console.html"},{"key":"Accept-Encoding","value":"gzip, deflate, br"},{"key":"Accept-Language","value":"en,en-GB;q=0.9,es-ES;q=0.8,es;q=0.7"},{"key":"Cookie","value":"_ga=GA1.3.1677929456.1584731102; _gid=GA1.3.1984759387.1584731102; PHPSESSID=642c4680uen9e29rui8liouom8; _identity=2cea55579ef1198f330cff9bccee3aab91c68b4e0af4db2fad3cf6d2907af8b3a%3A2%3A%7Bi%3A0%3Bs%3A9%3A%22_identity%22%3Bi%3A1%3Bs%3A49%3A%22%5B4696%2C%22x3TX8j-dSNyxye0kBhIS0P3D-aRVoFLD%22%2C1209600%5D%22%3B%7D; _gat=1; _csrf=a9fc8fa0ec419f012c31861465dc467160dab746762cc17c26ceaacbb7fbbe1ca%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22V89Ng_Y-Am3rlkK7DquCCJjEM-7yc8Xg%22%3B%7D"}]}},{"name":"POST /public-api/users","request":{"method":"POST","url":{"raw":"https://gorest.co.in/public-api/users","protocol":"https","host":"gorest.co.in","path":"/public-api/users"},"header":[{"key":"Pragma","value":"no-cache"},{"key":"Cache-Control","value":"no-cache"},{"key":"Accept","value":"application/json, text/plain, */*"},{"key":"Sec-Fetch-Dest","value":"empty"},{"key":"Authorization","value":"Bearer GycBk4kyvJYJWcIV33YwdR5yPXi7WeXtKqmY"},{"key":"User-Agent","value":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"},{"key":"Content-Type","value":"application/json;charset=UTF-8"},{"key":"Origin","value":"https://gorest.co.in"},{"key":"Sec-Fetch-Site","value":"same-origin"},{"key":"Sec-Fetch-Mode","value":"cors"},{"key":"Referer","value":"https://gorest.co.in/rest-console.html"},{"key":"Accept-Encoding","value":"gzip, deflate, br"},{"key":"Accept-Language","value":"en,en-GB;q=0.9,es-ES;q=0.8,es;q=0.7"},{"key":"Cookie","value":"_ga=GA1.3.1677929456.1584731102; _gid=GA1.3.1984759387.1584731102; PHPSESSID=642c4680uen9e29rui8liouom8; _identity=2cea55579ef1198f330cff9bccee3aab91c68b4e0af4db2fad3cf6d2907af8b3a%3A2%3A%7Bi%3A0%3Bs%3A9%3A%22_identity%22%3Bi%3A1%3Bs%3A49%3A%22%5B4696%2C%22x3TX8j-dSNyxye0kBhIS0P3D-aRVoFLD%22%2C1209600%5D%22%3B%7D; _csrf=fc4a35ef08f0d008e311139ac33b9da174ad3291d3a04b7481945c0cfcb537b6a%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22GrZBGEDHp0VtUGu3JNl8PgK87fb9hH58%22%3B%7D"}],"body":{"mode":"raw","raw":"{\\"first_name\\":\\"Brian\\",\\"last_name\\":\\"Ratke\\",\\"gender\\":\\"male\\",\\"email\\":\\"lew19@roberts.com\\",\\"status\\":\\"active\\"}","options":{"raw":{"language":"json"}}}}}]}`;
  expectEqualWithoutFormat(expected, output);
});

test("PostmanCollection2 should work - Sample 2", () => {
  const harFile = "{\"log\":{\"version\":\"1.2\",\"creator\":{\"name\":\"Proxyman\",\"version\":\"2.31.0\"},\"entries\":[{\"time\":2309.138916015625,\"_isHTTPS\":true,\"_webSocketMessages\":null,\"_remoteDeviceIP\":null,\"timings\":{\"connect\":1,\"send\":-1,\"dns\":-1,\"ssl\":-1,\"wait\":-1,\"blocked\":-1,\"receive\":-1},\"_serverAddress\":\"104.18.230.83\",\"_isIntercepted\":true,\"_id\":\"13\",\"serverIPAddress\":\"104.18.230.83\",\"_name\":\"13\",\"_clientAddress\":\"127.0.0.1\",\"_clientBundlePath\":\"\\/Applications\\/Product Hunt.app\",\"request\":{\"method\":\"GET\",\"bodySize\":-1,\"headersSize\":480,\"cookies\":[],\"headers\":[{\"name\":\"Host\",\"value\":\"api.producthunt.com\"},{\"name\":\"Content-Type\",\"value\":\"application\\/json\"},{\"name\":\"Connection\",\"value\":\"keep-alive\"},{\"name\":\"If-None-Match\",\"value\":\"W\\/\\\"ea5fb80e1a89f2e4747d0273320cfdb4\\\"\"},{\"name\":\"Accept\",\"value\":\"application\\/json\"},{\"name\":\"If-Modified-Since\",\"value\":\"Wed, 25 Aug 2021 08:49:52 GMT\"},{\"name\":\"User-Agent\",\"value\":\"Product Hunt\\/1.0.3 (Mac OS X Version 10.16 (Build 20G95))\"},{\"name\":\"Accept-Language\",\"value\":\"en-VN;q=1\"},{\"name\":\"Authorization\",\"value\":\"Bearer a2b5081dd96232bd0f6f309ad5d5a41c59560a4d67d0fe21d58a019c9f52a35b\"},{\"name\":\"Accept-Encoding\",\"value\":\"gzip, deflate\"}],\"queryString\":[{\"name\":\"days_ago\",\"value\":\"0\"},{\"name\":\"search[category]\",\"value\":\"all\"}],\"httpVersion\":\"HTTP\\/1.1\",\"url\":\"https:\\/\\/api.producthunt.com\\/v1\\/posts?days_ago=0&search%5Bcategory%5D=all\"},\"_serverPort\":443,\"_clientName\":\"Product Hunt\",\"_clientPort\":63258,\"response\":{\"status\":200,\"bodySize\":368851,\"headersSize\":989,\"cookies\":[],\"statusText\":\"OK\",\"headers\":[{\"name\":\"Date\",\"value\":\"Wed, 25 Aug 2021 08:51:15 GMT\"},{\"name\":\"Content-Type\",\"value\":\"application\\/json; charset=utf-8\"},{\"name\":\"Transfer-Encoding\",\"value\":\"chunked\"},{\"name\":\"Connection\",\"value\":\"keep-alive\"},{\"name\":\"CF-Ray\",\"value\":\"684393cf6e064927-SIN\"},{\"name\":\"Cache-Control\",\"value\":\"max-age=0, private, must-revalidate\"},{\"name\":\"ETag\",\"value\":\"W\\/\\\"e351e05c90b690ca7494bc342034e751\\\"\"},{\"name\":\"Last-Modified\",\"value\":\"Wed, 25 Aug 2021 08:51:10 GMT\"},{\"name\":\"Strict-Transport-Security\",\"value\":\"max-age=2592000; includeSubDomains; preload\"},{\"name\":\"Vary\",\"value\":\"Origin, Accept-Encoding\"},{\"name\":\"CF-Cache-Status\",\"value\":\"DYNAMIC\"},{\"name\":\"Expect-CT\",\"value\":\"max-age=604800, report-uri=\\\"https:\\/\\/report-uri.cloudflare.com\\/cdn-cgi\\/beacon\\/expect-ct\\\"\"},{\"name\":\"Referrer-Policy\",\"value\":\"strict-origin-when-cross-origin\"},{\"name\":\"X-Content-Type-Options\",\"value\":\"nosniff\"},{\"name\":\"X-Download-Options\",\"value\":\"noopen\"},{\"name\":\"X-Frame-Options\",\"value\":\"SAMEORIGIN\"},{\"name\":\"X-Permitted-Cross-Domain-Policies\",\"value\":\"none\"},{\"name\":\"X-Request-Id\",\"value\":\"7b3586bc-2e24-4075-88a4-1f58eb67828e\"},{\"name\":\"X-Runtime\",\"value\":\"0.154128\"},{\"name\":\"X-XSS-Protection\",\"value\":\"1; mode=block\"},{\"name\":\"Server\",\"value\":\"cloudflare\"},{\"name\":\"Content-Encoding\",\"value\":\"gzip\"},{\"name\":\"alt-svc\",\"value\":\"h3-27=\\\":443\\\"; ma=86400, h3-28=\\\":443\\\"; ma=86400, h3-29=\\\":443\\\"; ma=86400, h3=\\\":443\\\"; ma=86400\"}],\"httpVersion\":\"HTTP\\/1.1\",\"redirectURL\":\"\"},\"comment\":\"\",\"startedDateTime\":\"2021-08-25T15:51:14.305+0700\",\"cache\":{}}]}}";
  let request = {
    harString: harFile
  }
  const output = CodeGenerator.convert(request, "postmanCollection2");
  let expected = `{"info":{"name":"Proxyman Code Generator: PostmanCollection2","schema":"https://schema.getpostman.com/json/collection/v2.1.0/collection.json"},"item":[{"name":"GET /v1/posts","request":{"method":"GET","url":{"raw":"https://api.producthunt.com/v1/posts?days_ago=0&search%5Bcategory%5D=all","protocol":"https","host":"api.producthunt.com","path":"/v1/posts","query":[{"value":"0","key":"days_ago"},{"value":"all","key":"search[category]"}]},"header":[{"key":"Content-Type","value":"application/json"},{"key":"If-None-Match","value":"W/\\"ea5fb80e1a89f2e4747d0273320cfdb4\\""},{"key":"Accept","value":"application/json"},{"key":"If-Modified-Since","value":"Wed, 25 Aug 2021 08:49:52 GMT"},{"key":"User-Agent","value":"Product Hunt/1.0.3 (Mac OS X Version 10.16 (Build 20G95))"},{"key":"Accept-Language","value":"en-VN;q=1"},{"key":"Authorization","value":"Bearer a2b5081dd96232bd0f6f309ad5d5a41c59560a4d67d0fe21d58a019c9f52a35b"},{"key":"Accept-Encoding","value":"gzip, deflate"}]}}]}`;
  expectEqualWithoutFormat(expected, output);
});
