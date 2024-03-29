// Generated by CoffeeScript 2.5.1
// in API v0.2.0 and below (Paw 2.2.2 and below), require had no return value
const Mustache = require("mustache");
const URI = require("URIjs");

const addslashes = function (str) {
  return `${str}`.replace(/[\\"]/g, "\\$&");
};

const addBackSlashes = function (str) {
  return `${str}`.replace(/[\\`]/g, "\\$&");
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
    fullpath: request.url,
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
        raw_body: addBackSlashes(raw_body),
      };
    } else {
      return {
        has_long_body: true,
      };
    }
  }
};

const json_body_object = function (object) {
  var key, s, value;
  if (object === null) {
    s = "null";
  } else if (typeof object === "string") {
    s = `\"${addslashes(object)}\"`;
  } else if (typeof object === "number") {
    s = `${object}`;
  } else if (typeof object === "boolean") {
    s = `${object ? "true" : "false"}`;
  } else if (typeof object === "object") {
    if (object.length != null) {
      s =
        "[" +
        function () {
          var i, len, results;
          results = [];
          for (i = 0, len = object.length; i < len; i++) {
            value = object[i];
            results.push(`${json_body_object(value)}`);
          }
          return results;
        }
          .call(this)
          .join(",") +
        "]";
    } else {
      s =
        "{" +
        function () {
          var results;
          results = [];
          for (key in object) {
            value = object[key];
            results.push(
              `\"${addslashes(key)}\": ${json_body_object(value)}`
            );
          }
          return results;
        }
          .call(this)
          .join(",") +
        "}";
    }
  }
  return s;
};

exports.generate = function (request) {
  const url = urlTransform(request)
  const view = {
    request: request,
    method: request.method.toUpperCase(),
    url: url,
    headers: headersTransform(request),
    body: bodyTransform(request),
    headline: `${request.method.toUpperCase()} ${url.base}`,
    version: metadata.version
  };
  return Mustache.render(codeTemplate, view);
};

const metadata = {
  name: "Go HTTP",
  fileExtension: "go",
  identifier: "com.proxyman.plugin.GoHTTPCodeGenerator",
  author: "Paw and Proxyman",
  version: "1.0.0",
};

// Inlcude a template because we could not build require("fs") in webpack

const codeTemplate =
`package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
{{#body.has_url_encoded_body}}
	"net/url"
	"bytes"
{{/body.has_url_encoded_body}}
{{#body.has_raw_body}}
	"strings"
{{/body.has_raw_body}}
{{#body.has_long_body}}
	"strings"
{{/body.has_long_body}}
{{#body.has_multipart_body}}
	"mime/multipart"
	"bytes"
{{/body.has_multipart_body}}
{{#body.has_json_body}}
	"bytes"
{{/body.has_json_body}}
)

func send{{{codeSlug}}}() error {
  // Proxyman Code Generator ({{{version}}}): Go HTTP
  // {{{headline}}}

	{{#body.has_raw_body}}
	body := strings.NewReader(\`{{{body.raw_body}}}\`)

	{{/body.has_raw_body}}
	{{! ----- }}
	{{#body.has_long_body}}
	body := strings.NewReader(\`set your body string\`)

	{{/body.has_long_body}}
	{{! ----- }}
	{{#body.has_url_encoded_body}}
	params := url.Values{}
	{{#body.url_encoded_body}}
	params.Set("{{{name}}}", "{{{value}}}")
	{{/body.url_encoded_body}}
	body := bytes.NewBufferString(params.Encode())

	{{/body.has_url_encoded_body}}
	{{! ----- }}
	{{#body.has_multipart_body}}
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	{{#body.multipart_body}}
	writer.WriteField("{{{name}}}","{{{value}}}")
	{{/body.multipart_body}}
	writer.Close()

	{{/body.has_multipart_body}}
	{{! ----- }}
	{{#body.has_json_body}}
	json := []byte(\`{{{body.json_body_object}}}\`)
	body := bytes.NewBuffer(json)

	{{/body.has_json_body}}

	// Create request
	{{#body}}
	req, err := http.NewRequest("{{{method}}}", "{{{url.fullpath}}}", body)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return err
	}

	{{/body}}
	{{^body}}
	req, err := http.NewRequest("{{{method}}}", "{{{url.fullpath}}}", nil)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return err
	}

	{{/body}}
	{{! ----- }}
	{{#headers.has_headers}}
	// Headers
	{{#headers.header_list}}
	req.Header.Add("{{{header_name}}}", "{{{header_value}}}")
	{{/headers.header_list}}

	{{/headers.has_headers}}
	{{! ----- }}
	{{#body.has_multipart_body}}
	req.Header.Add("Content-Type", writer.FormDataContentType())

	{{/body.has_multipart_body}}
	{{! ----- }}
	{{! Read params from url and add them }}
	{{#url.has_params}}
	if err := req.ParseForm(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		return err 
	}

	{{/url.has_params}}
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
}
`;