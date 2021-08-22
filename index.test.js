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
