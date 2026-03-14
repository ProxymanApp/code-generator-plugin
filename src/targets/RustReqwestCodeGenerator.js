const Mustache = require("mustache");
const URI = require("URIjs");

const addslashes = function (str) {
  return `${str}`.replace(/[\\"]/g, "\\$&");
};

const urlTransform = function (request) {
  return {
    fullpath: addslashes(request.url),
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

const json_body_object = function (object, indent = 2) {
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
              `${indent_str_children}${json_body_object(value, indent + 1)}`
            );
          }
          return results;
        })
          .call(this)
          .join(",\n") +
        `\n${indent_str}]`;
    } else {
      s =
        "{\n" +
        (function () {
          var results;
          results = [];
          for (key in object) {
            value = object[key];
            results.push(
              `${indent_str_children}\"${addslashes(key)}\": ${json_body_object(value, indent + 1)}`
            );
          }
          return results;
        })
          .call(this)
          .join(",\n") +
        `\n${indent_str}}`;
    }
  }
  return s;
};

const bodyTransform = function (request) {
  var json_body, multipart_body, name, raw_body, url_encoded_body, value;
  json_body = request.jsonBody;
  if (json_body) {
    return {
      has_body: true,
      has_json_body: true,
      json_body_object: json_body_object(json_body, 2),
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
    return {
      has_body: true,
      has_raw_body: true,
      raw_body: addslashes(raw_body),
    };
  }
  return {};
};

exports.generate = function (request) {
  const url = urlTransform(request);
  const _uri = URI(request.url);
  _uri.search("");
  const view = {
    request: request,
    method: request.method.toLowerCase(),
    url: url,
    headers: headersTransform(request),
    body: bodyTransform(request),
    headline: `${request.method.toUpperCase()} ${_uri.toString()}`,
    version: metadata.version,
  };
  return Mustache.render(codeTemplate, view);
};

const metadata = {
  name: "Rust reqwest",
  fileExtension: "rs",
  identifier: "com.proxyman.plugin.RustReqwestCodeGenerator",
  author: "Proxyman",
  version: "1.0.0",
};

const codeTemplate = `use reqwest::blocking::Client;
{{#body.has_json_body}}
use serde_json::json;
{{/body.has_json_body}}
{{#body.has_url_encoded_body}}
use std::collections::HashMap;
{{/body.has_url_encoded_body}}
{{#body.has_multipart_body}}
use reqwest::blocking::multipart;
{{/body.has_multipart_body}}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Proxyman Code Generator ({{{version}}}): Rust + reqwest
    // {{{headline}}}

    let client = Client::new();
{{#body.has_json_body}}

    let json_body = json!({{{body.json_body_object}}});
{{/body.has_json_body}}
{{#body.has_url_encoded_body}}

    let mut params = HashMap::new();
{{#body.url_encoded_body}}
    params.insert("{{{name}}}", "{{{value}}}");
{{/body.url_encoded_body}}
{{/body.has_url_encoded_body}}
{{#body.has_multipart_body}}

    let form = multipart::Form::new()
{{#body.multipart_body}}
        .text("{{{name}}}", "{{{value}}}")
{{/body.multipart_body}}
    ;
{{/body.has_multipart_body}}

    let response = client.{{{method}}}("{{{url.fullpath}}}")
{{#headers.has_headers}}
{{#headers.header_list}}
        .header("{{{header_name}}}", "{{{header_value}}}")
{{/headers.header_list}}
{{/headers.has_headers}}
{{#body.has_json_body}}
        .json(&json_body)
{{/body.has_json_body}}
{{#body.has_url_encoded_body}}
        .form(&params)
{{/body.has_url_encoded_body}}
{{#body.has_multipart_body}}
        .multipart(form)
{{/body.has_multipart_body}}
{{#body.has_raw_body}}
        .body("{{{body.raw_body}}}")
{{/body.has_raw_body}}
        .send()?;

    println!("{}", response.text()?);

    Ok(())
}
`;
