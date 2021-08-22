// Generated by CoffeeScript 2.5.1
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
  var json_body, multipart_body, name, raw_body, url_encoded_body, value;
  json_body = request.jsonBody;
  if (json_body) {
    return {
      has_body: true,
      has_json_body: true,
      json_body_object: json_body_object(json_body, 0),
    };
  }
  url_encoded_body = request.urlEncodedBody;
  if (url_encoded_body) {
    return {
      has_body: true,
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
  multipart_body = request.multipartBody;
  if (multipart_body) {
    return {
      has_body: true,
      has_multipart_body: true,
      multipart_body: (function () {
        var results;
        results = [];
        for (name in multipart_body) {
          value = multipart_body[name];
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
        has_body: true,
        has_raw_body: true,
        raw_body: addslashes(raw_body),
      };
    } else {
      return {
        has_body: true,
        has_long_body: true,
      };
    }
  }
  return {
    has_body: false,
  };
};

const json_body_object = function (object, indent = 0) {
  var indent_str, indent_str_children, key, s, value;
  if (object === null) {
    s = "null";
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
        "{\n" +
        function () {
          var results;
          results = [];
          for (key in object) {
            value = object[key];
            results.push(
              `${indent_str_children}\"${addslashes(
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
  return s;
};

exports.generate = function (request) {
  const method = request.method.toUpperCase();
  const url = urlTransform(request);
  const view = {
    request: request,
    url: url,
    method: method,
    headers: headersTransform(request),
    body: bodyTransform(request),
    has_content: method !== "GET" && method !== "HEAD",
    headline: `${request.method.toUpperCase()} ${url.base}`,
    version: metadata.version
  };
  // convenience variable
  view.has_content_and_url_params = view.has_content && view.url.has_params;
  // if not has_content, just remove the body
  if (!view.has_content) {
    view.body = null;
  }
  return Mustache.render(codeTemplate, view);
};

const metadata = {
  name: "Javascript + jQuery",
  fileExtension: "js",
  identifier: "com.proxyman.plugin.javascriptJQueryCodeGenerator",
  author: "Paw and Proxyman",
  version: "1.0.0",
};

// Inlcude a template because we could not build require("fs") in webpack

const codeTemplate = 
`/**
 Proxyman Code Generator ({{{version}}}): Javascript + jQuery
 {{{headline}}}
 */

{{! ================ multipart body ================ }}
{{#body.has_multipart_body}}
var formData = new FormData();
{{#body.multipart_body}}
formData.append("{{{name}}}", "{{{value}}}");
{{/body.multipart_body}}

{{/body.has_multipart_body}}
jQuery.ajax({
    {{! ================ url + url params ================ }}
    {{#has_content_and_url_params}}
    url: "{{{url.base}}}?" + jQuery.param({
    {{#url.params}}
        "{{{name}}}": "{{{value}}}",
    {{/url.params}}
    }),
    {{/has_content_and_url_params}}
    {{! ================ url (base) ================ }}
    {{^has_content_and_url_params}}
    url: "{{{url.base}}}",
    {{/has_content_and_url_params}}
    {{! ================ method ================ }}
    type: "{{{method}}}",
    {{! ================ url parameters ================ }}
    {{^has_content_and_url_params}}
    {{#url.has_params}}
    data: {
    {{#url.params}}
        "{{{name}}}": "{{{value}}}",
    {{/url.params}}
    },
    {{/url.has_params}}
    {{/has_content_and_url_params}}
    {{! ================ headers ================ }}
    {{#headers.has_headers}}
    headers: {
        {{#headers.header_list}}
        "{{{header_name}}}": "{{{header_value}}}",
        {{/headers.header_list}}
    },
    {{/headers.has_headers}}
    {{! ================ raw body ================ }}
    {{#body.has_raw_body}}
    processData: false,
    data: "{{{body.raw_body}}}",
    {{/body.has_raw_body}}
    {{! ================ too long body ================ }}
    {{#body.has_long_body}}
    processData: false,
    data: "", // set your body string
    {{/body.has_long_body}}
    {{! ================ url-encoded body ================ }}
    {{#body.has_url_encoded_body}}
    contentType: "application/x-www-form-urlencoded",
    data: {
    {{#body.url_encoded_body}}
        "{{{name}}}": "{{{value}}}",
    {{/body.url_encoded_body}}
    },
    {{/body.has_url_encoded_body}}
    {{! ================ multipart body ================ }}
    {{#body.has_multipart_body}}
    processData: false,
    contentType: false,
    data: formData,
    {{/body.has_multipart_body}}
    {{! ================ json body ================ }}
    {{#body.has_json_body}}
    contentType: "application/json",
    data: JSON.stringify({{{body.json_body_object}}})
    {{/body.has_json_body}}
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
});
`;