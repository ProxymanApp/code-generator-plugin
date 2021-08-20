const CodeGenerator = require("./src/code-generator");

// Testing
const body = {
  Name: "Proxyman",
  Country: "Singapore",
};

var request = {
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

test("Swift Alamofire should work", () => {
  const output = CodeGenerator.convert(request, "swift-alamofire");
  let expected = 
  `func sendRequest() {
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
  // Compare two strings without format
  expect(output.replace(/\s/g, '')).toEqual(expected.replace(/\s/g, ''));
});
