const Mustache = require("mustache");
const URI = require("URIjs");

const addslashes = function (str) {
  return `${str}`.replace(/[\\"]/g, "\\$&");
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
      json_body_object: json_body_object(json_body),
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
    if (raw_body.length < 10000) {
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
    s = "[NSNull null]";
  } else if (typeof object === "string") {
    s = `@\"${addslashes(object)}\"`;
  } else if (typeof object === "number") {
    s = `@${object}`;
  } else if (typeof object === "boolean") {
    s = `@${object ? "YES" : "NO"}`;
  } else if (typeof object === "object") {
    indent_str = Array(indent + 1).join("\t");
    indent_str_children = Array(indent + 2).join("\t");
    if (object.length != null) {
      s =
        "@[\n" +
        function () {
          var i, len, results;
          results = [];
          for (i = 0, len = object.length; i < len; i++) {
            value = object[i];
            results.push(
              `${indent_str_children}${json_body_object(
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
    } else {
      s =
        "@{\n" +
        function () {
          var results;
          results = [];
          for (key in object) {
            value = object[key];
            results.push(
              `${indent_str_children}@\"${addslashes(
                key
              )}\": ${json_body_object(value, indent + 1)}`
            );
          }
          return results;
        }
          .call(this)
          .join(",\n") +
        `\n${indent_str}}`;
    }
  }
  if (indent === 0) {
    if (typeof object === "object") {
      // NSArray
      if (object.length != null) {
        s = `NSArray* bodyObject = ${s};`;
      } else {
        // NSDictionary
        s = `NSDictionary* bodyObject = ${s};`;
      }
    } else {
      s = `id bodyObject = ${s};`;
    }
  }
  return s;
};

exports.generate = function (request) {
  var view;
  const url = urlTransform(request);
  const method = request.method.toUpperCase();
  view = {
    request: request,
    url: url,
    headers: headersTransform(request),
    body: bodyTransform(request),
    headline: `${method.toUpperCase()} ${url.base}`,
    version: metadata.version,
  };
  if (view.url.has_params || (view.body && view.body.has_url_encoded_body)) {
    view["has_utils_query_string"] = true;
  }
  return Mustache.render(codeTemplate, view);
};

const metadata = {
  name: "Objective-C NSURLSession",
  fileExtension: "m",
  identifier: "com.proxyman.plugin.ObjectiveCNSURLSession",
  author: "Paw and Proxyman",
  version: "1.0.0",
};

// Inlcude a template because we could not build require("fs") in webpack

const codeTemplate = 
`/**
  Proxyman Code Generator ({{{version}}}): Objective-C NSURLSession
  {{{headline}}}
*/

NSURL* URL = [NSURL URLWithString:@"{{{url.base}}}"];
{{#url.has_params}}
NSDictionary* URLParams = @{
{{#url.params}}
    @"{{{name}}}": @"{{{value}}}",
{{/url.params}}
};
URL = NSURLByAppendingQueryParameters(URL, URLParams);
{{/url.has_params}}
NSMutableURLRequest* request = [NSMutableURLRequest requestWithURL:URL];
request.HTTPMethod = @"{{{request.method}}}";

{{#headers.has_headers}}
// Headers

{{#headers.header_list}}
[request addValue:@"{{{header_value}}}" forHTTPHeaderField:@"{{{header_name}}}"];
{{/headers.header_list}}

{{/headers.has_headers}}
{{#body.has_url_encoded_body}}
// Form URL-Encoded Body

NSDictionary* bodyParameters = @{
{{#body.url_encoded_body}}
	@"{{{name}}}": @"{{{value}}}",
{{/body.url_encoded_body}}
};
request.HTTPBody = [NSStringFromQueryParameters(bodyParameters) dataUsingEncoding:NSUTF8StringEncoding];

{{/body.has_url_encoded_body}}
{{#body.has_json_body}}
// JSON Body

{{{body.json_body_object}}}
request.HTTPBody = [NSJSONSerialization dataWithJSONObject:bodyObject options:kNilOptions error:NULL];

{{/body.has_json_body}}
{{#body.has_raw_body}}
// Body

request.HTTPBody = [@"{{{body.raw_body}}}" dataUsingEncoding:NSUTF8StringEncoding];

{{/body.has_raw_body}}
{{#body.has_long_body}}
// Body

request.HTTPBody = nil; // Set your own body data

{{/body.has_long_body}}
// Connection

NSURLConnection* connection = [NSURLConnection connectionWithRequest:request delegate:nil];
[connection start];

{{#has_utils_query_string}}
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
}
{{/has_utils_query_string}}
`;
