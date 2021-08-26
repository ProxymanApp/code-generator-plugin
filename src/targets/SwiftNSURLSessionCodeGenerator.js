// Generated by CoffeeScript 2.5.1
const Mustache = require("mustache");
const URI = require("URIjs");

const addslashes = function (str) {
  return `${str}`
    .replace(/[\\"]/g, "\\$&")
    .replace(/(?:\r)/g, "\\r")
    .replace(/(?:\n)/g, "\\n");
};

const urlTransform = function (request) {
  var name, url_params, url_params_object, value;
  url_params_object = (function () {
    var _uri;
    _uri = URI(request.url);
    return _uri.search(true);
  })();
  url_params = (function () {
    var results;
    results = [];
    for (name in url_params_object) {
      value = url_params_object[name];
      results.push({
        name: addslashes(name),
        value: addslashes(value),
      });
    }
    return results;
  })();
  return {
    base: addslashes(
      (function () {
        var _uri;
        _uri = URI(request.url);
        _uri.search("");
        return _uri;
      })()
    ),
    params: url_params,
    has_params: url_params.length > 0,
  };
};

const headersTransform = function (request) {
  var header_name, header_value, headers;
  headers = request.headers;
  return {
    has_headers: Object.keys(headers).length > 0,
    header_list: (function () {
      var results;
      results = [];
      for (header_name in headers) {
        header_value = headers[header_name];
        results.push({
          header_name: addslashes(header_name),
          header_value: addslashes(header_value),
        });
      }
      return results;
    })(),
  };
};

const bodyTransform = function (request) {
  var json_body, name, raw_body, url_encoded_body, value;
  json_body = request.jsonBody;
  if (json_body) {
    return {
      has_json_body: true,
      json_body_object: json_body_object(json_body, 1),
    };
  }
  url_encoded_body = request.urlEncodedBody;
  if (url_encoded_body) {
    return {
      has_url_encoded_body: true,
      url_encoded_body: (function () {
        var results;
        results = [];
        for (name in url_encoded_body) {
          value = url_encoded_body[name];
          results.push({
            name: addslashes(name),
            value: addslashes(value),
          });
        }
        return results;
      })(),
    };
  }
  raw_body = request.body;
  if (raw_body) {
    if (raw_body.length < 5000) {
      return {
        has_raw_body: true,
        raw_body: addslashes(raw_body),
      };
    } else {
      return {
        has_long_body: true,
      };
    }
  }
};

const json_body_object = function (object, indent = 0) {
  var indent_str, indent_str_children, key, s, value;
  if (object === null) {
    s = "NSNull()";
  } else if (typeof object === "string") {
    s = `\"${addslashes(object)}\"`;
  } else if (typeof object === "number") {
    s = `${object}`;
  } else if (typeof object === "boolean") {
    s = `${object ? "true" : "false"}`;
  } else if (typeof object === "object") {
    indent_str = Array(indent + 2).join("    ");
    indent_str_children = Array(indent + 3).join("    ");
    if (object.length != null) {
      s =
        "[\n" +
        function () {
          var i, len, results;
          results = [];
          for (i = 0, len = object.length; i < len; i++) {
            value = object[i];
            results.push(
              `${indent_str_children}${json_body_object(value, indent + 1)}`
            );
          }
          return results;
        }
          .call(this)
          .join(",\n") +
        `\n${indent_str}]`;
    } else {
      s =
        "[\n" +
        function () {
          var results;
          results = [];
          for (key in object) {
            value = object[key];
            results.push(
              `${indent_str_children}\"${addslashes(key)}\": ${json_body_object(
                value,
                indent + 1
              )}`
            );
          }
          return results;
        }
          .call(this)
          .join(",\n") +
        `\n${indent_str}]`;
    }
  }
  if (indent <= 1) {
    s = `let bodyObject: [String : Any] = ${s}`;
  }
  return s;
};

exports.generate = function (request) {
  var view;
  const url = urlTransform(request);
  view = {
    request: request,
    url: url,
    headers: headersTransform(request),
    body: bodyTransform(request),
    headline: `${request.method.toUpperCase()} ${url.base}`,
    version: metadata.version
  };
  if (view.url.has_params || (view.body && view.body.has_url_encoded_body)) {
    view["has_utils_query_string"] = true;
  }
  return Mustache.render(codeTemplate, view);
};

const metadata = {
  name: "Swift URLSession",
  fileExtension: "swift",
  identifier: "com.proxyman.plugin.SwiftNSURLSessionGenerator",
  author: "Paw and Proxyman",
  version: "1.0.0",
};

// Inlcude a template because we could not build require("fs") in webpack

const codeTemplate = `class MyRequestController {
  func sendRequest() {
    /**
     Proxyman Code Generator ({{{version}}}): Swift + URLSession
     {{{headline}}}
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
         {{{request.name}}} ({{{request.method}}} {{{url.base}}})
       */

      guard var URL = URL(string: "{{{url.base}}}") else {return}
      {{#url.has_params}}
      let URLParams = [
      {{#url.params}}
          "{{{name}}}": "{{{value}}}",
      {{/url.params}}
      ]
      URL = URL.appendingQueryParameters(URLParams)
      {{/url.has_params}}
      var request = URLRequest(url: URL)
      request.httpMethod = "{{{request.method}}}"

      {{#headers.has_headers}}
      // Headers

      {{#headers.header_list}}
      request.addValue("{{{header_value}}}", forHTTPHeaderField: "{{{header_name}}}")
      {{/headers.header_list}}

      {{/headers.has_headers}}
      {{#body.has_url_encoded_body}}
      // Form URL-Encoded Body

      let bodyParameters = [
      {{#body.url_encoded_body}}
          "{{{name}}}": "{{{value}}}",
      {{/body.url_encoded_body}}
      ]
      let bodyString = bodyParameters.queryParameters
      request.httpBody = bodyString.data(using: .utf8, allowLossyConversion: true)

      {{/body.has_url_encoded_body}}
      {{#body.has_json_body}}
      // JSON Body

      {{{body.json_body_object}}}
      request.httpBody = try! JSONSerialization.data(withJSONObject: bodyObject, options: [])

      {{/body.has_json_body}}
      {{#body.has_raw_body}}
      // Body

      let bodyString = "{{{body.raw_body}}}"
      request.httpBody = bodyString.data(using: .utf8, allowLossyConversion: true)

      {{/body.has_raw_body}}
      {{#body.has_long_body}}
      // Body

      let bodyString = "" // set your body string
      request.httpBody = bodyString.data(using: .utf8, allowLossyConversion: true)

      {{/body.has_long_body}}
      /* Start a new Task */
      let task = session.dataTask(with: request, completionHandler: { (data: Data?, response: URLResponse?, error: Error?) -> Void in
          if (error == nil) {
              // Success
              let statusCode = (response as! HTTPURLResponse).statusCode
              print("URL Session Task Succeeded: HTTP \\(statusCode)")
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

{{#has_utils_query_string}}

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
}
{{/has_utils_query_string}}
`;
