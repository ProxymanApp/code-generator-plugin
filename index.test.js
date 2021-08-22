const CodeGenerator = require("./src/code-generator");

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
  let expected = `func sendRequest() {
    /**
     Proxyman Code Generator (1.0.0): Swift + Alamofire 4
     POST https://proxyman.io/get
     */
  
    // Add Headers
    let headers = [
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
    Alamofire.request("https://proxyman.io/get?data=123", method: .post, parameters: body, encoding: JSONEncoding.default, headers: headers)
        .validate(statusCode: 200..<300)
        .responseJSON { response in
            if (response.result.error == nil) {
                debugPrint("HTTP Response Body: (response.data)")
            }
            else {
                debugPrint("HTTP Request failed: (response.result.error)")
            }
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
   Proxyman Code Generator (1.0.0): Swift + Alamofire 4
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
    "method": "POST",
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
  let expected = `# Proxyman Code Generator (1.0.0): HTTPie
  # POST https://proxyman.io/get
  
  http --json POST 'https://proxyman.io/get?data=123' \\
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