const Mustache = require("mustache");
const URI = require("URIjs");

const phpEscapeSingleQuote = function (str) {
  return `${str}`.replace(/[\\']/g, "\\$&");
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
        name: phpEscapeSingleQuote(name),
        value: phpEscapeSingleQuote(value),
      });
    }
    return results;
  })();
  return {
    base: phpEscapeSingleQuote(
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
          header_name: phpEscapeSingleQuote(header_name),
          header_value: phpEscapeSingleQuote(header_value),
        });
      }
      return results;
    })(),
  };
};

const json_body_object = function (object, indent = 1) {
  var indent_str, indent_str_children, key, s, value;
  if (object === null) {
    s = "null";
  } else if (typeof object === "string") {
    s = `'${phpEscapeSingleQuote(object)}'`;
  } else if (typeof object === "number") {
    s = `${object}`;
  } else if (typeof object === "boolean") {
    s = `${object ? "true" : "false"}`;
  } else if (typeof object === "object") {
    indent_str = "    ".repeat(indent);
    indent_str_children = "    ".repeat(indent + 1);
    if (object.length != null) {
      s =
        "[\n" +
        (function () {
          var i, len, results;
          results = [];
          for (i = 0, len = object.length; i < len; i++) {
            value = object[i];
            results.push(
              `${indent_str_children}${json_body_object(value, indent + 1)},`
            );
          }
          return results;
        })
          .call(this)
          .join("\n") +
        `\n${indent_str}]`;
    } else {
      s =
        "[\n" +
        (function () {
          var results;
          results = [];
          for (key in object) {
            value = object[key];
            results.push(
              `${indent_str_children}'${phpEscapeSingleQuote(key)}' => ${json_body_object(value, indent + 1)},`
            );
          }
          return results;
        })
          .call(this)
          .join("\n") +
        `\n${indent_str}]`;
    }
  }
  return s;
};

const bodyTransform = function (request) {
  var json_body, multipart_body, name, raw_body, url_encoded_body, value;
  json_body = request.jsonBody;
  if (json_body) {
    return {
      has_json_body: true,
      json_body_object: json_body_object(json_body, 2),
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
            name: phpEscapeSingleQuote(name),
            value: phpEscapeSingleQuote(value),
          });
        }
        return results;
      })(),
    };
  }
  multipart_body = request.multipartBody;
  if (multipart_body) {
    return {
      has_multipart_body: true,
      multipart_body: (function () {
        var results;
        results = [];
        for (name in multipart_body) {
          value = multipart_body[name];
          results.push({
            name: phpEscapeSingleQuote(name),
            value: phpEscapeSingleQuote(value),
          });
        }
        return results;
      })(),
    };
  }
  raw_body = request.body;
  if (raw_body) {
    return {
      has_raw_body: true,
      raw_body: phpEscapeSingleQuote(raw_body),
    };
  }
  return {};
};

exports.generate = function (request) {
  const url = urlTransform(request);
  const view = {
    request: request,
    method: request.method.toUpperCase(),
    url: url,
    headers: headersTransform(request),
    body: bodyTransform(request),
    headline: `${request.method.toUpperCase()} ${url.base}`,
    version: metadata.version,
  };
  return Mustache.render(codeTemplate, view);
};

const metadata = {
  name: "PHP Guzzle",
  fileExtension: "php",
  identifier: "com.proxyman.plugin.PHPGuzzleCodeGenerator",
  author: "Proxyman",
  version: "1.0.0",
};

const codeTemplate = `<?php
require 'vendor/autoload.php';

use GuzzleHttp\\Client;

// Proxyman Code Generator ({{{version}}}): PHP + Guzzle
// {{{headline}}}

$client = new Client();

$response = $client->request('{{{method}}}', '{{{url.base}}}', [
{{#url.has_params}}
    'query' => [
{{#url.params}}
        '{{{name}}}' => '{{{value}}}',
{{/url.params}}
    ],
{{/url.has_params}}
{{#headers.has_headers}}
    'headers' => [
{{#headers.header_list}}
        '{{{header_name}}}' => '{{{header_value}}}',
{{/headers.header_list}}
    ],
{{/headers.has_headers}}
{{#body.has_json_body}}
    'json' => {{{body.json_body_object}}},
{{/body.has_json_body}}
{{#body.has_url_encoded_body}}
    'form_params' => [
{{#body.url_encoded_body}}
        '{{{name}}}' => '{{{value}}}',
{{/body.url_encoded_body}}
    ],
{{/body.has_url_encoded_body}}
{{#body.has_multipart_body}}
    'multipart' => [
{{#body.multipart_body}}
        [
            'name' => '{{{name}}}',
            'contents' => '{{{value}}}',
        ],
{{/body.multipart_body}}
    ],
{{/body.has_multipart_body}}
{{#body.has_raw_body}}
    'body' => '{{{body.raw_body}}}',
{{/body.has_raw_body}}
]);

echo $response->getStatusCode() . "\\n";
echo $response->getBody() . "\\n";
?>
`;
