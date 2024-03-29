// Generated by CoffeeScript 2.5.1
const Mustache = require("mustache");

const addslashes = function(str) {
  return `${str}`.replace(/[\\"]/g, '\\$&');
};

const multiLinesToSingleLine = function(str) {
  return `${str}`.replace(/[\n"]/g, '\\n');
};

const urlTransform = function(request) {
  return {
    "fullpath": request.url
  };
};

const headersTransform = function(request) {
  var header_name, header_value, headers;
  headers = request.headers;
  return {
    "has_headers": Object.keys(headers).length > 0,
    "header_list": (function() {
      var results;
      results = [];
      for (header_name in headers) {
        header_value = headers[header_name];
        results.push({
          "header_name": addslashes(header_name),
          "header_value": addslashes(header_value)
        });
      }
      return results;
    })()
  };
};

const bodyTransform = function(request) {
  var has_tabs_or_new_lines, json_body, multipart_body, name, raw_body, url_encoded_body, value;
  json_body = request.jsonBody;
  if (json_body) {
    return {
      "has_json_body": true,
      "json_body_object": json_body_object(json_body)
    };
  }
  url_encoded_body = request.urlEncodedBody;
  if (url_encoded_body) {
    return {
      "has_url_encoded_body": true,
      "url_encoded_body": (function() {
        var results;
        results = [];
        for (name in url_encoded_body) {
          value = url_encoded_body[name];
          results.push({
            "name": addslashes(name),
            "value": addslashes(value)
          });
        }
        return results;
      })()
    };
  }
  multipart_body = request.multipartBody;
  if (multipart_body) {
    return {
      "has_multipart_body": true,
      "multipart_body": (function() {
        var results;
        results = [];
        for (name in multipart_body) {
          value = multipart_body[name];
          results.push({
            "name": addslashes(name),
            "value": addslashes(value)
          });
        }
        return results;
      })()
    };
  }
  raw_body = request.body;
  if (raw_body) {
    if (raw_body.length < 5000) {
      has_tabs_or_new_lines = null !== /\r|\n|\t/.exec(raw_body);
      return {
        "has_raw_body": true,
        "raw_body": has_tabs_or_new_lines ? multiLinesToSingleLine(addslashes(raw_body)) : addslashes(raw_body)
      };
    } else {
      return {
        "has_long_body": true
      };
    }
  }
};

const json_body_object = function(object) {
  var key, s, value;
  if (object === null) {
    s = "null";
  } else if (typeof object === 'string') {
    s = `\\\"${addslashes(object)}\\\"`;
  } else if (typeof object === 'number') {
    s = `${object}`;
  } else if (typeof object === 'boolean') {
    s = `${object ? "true" : "false"}`;
  } else if (typeof object === 'object') {
    if (object.length != null) {
      s = '[' + ((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = object.length; i < len; i++) {
          value = object[i];
          results.push(`${json_body_object(value)}`);
        }
        return results;
      }).call(this)).join(',') + ']';
    } else {
      s = '{' + ((function() {
        var results;
        results = [];
        for (key in object) {
          value = object[key];
          results.push(`\\\"${addslashes(key)}\\\": ${json_body_object(value)}`);
        }
        return results;
      }).call(this)).join(',') + '}';
    }
  }
  return s;
};

exports.generate = function(request) {
  const url = urlTransform(request);
  const view = {
    "request": request,
    "method": request.method[0].toUpperCase() + request.method.slice(1).toLowerCase(),
    "url": url,
    "headers": headersTransform(request),
    "body": bodyTransform(request),
    "headline": `${request.method.toUpperCase()} ${url.base}`,
    "version": metadata.version
  };
  return Mustache.render(codeTemplate, view);
};

const metadata = {
  name: "Java Apache HTTP Client Fluent",
  fileExtension: "java",
  identifier: "com.proxyman.plugin.java",
  author: "Paw and Proxyman",
  version: "1.0.0",
};

// Inlcude a template because we could not build require("fs") in webpack

const codeTemplate =
`import java.io.IOException;
import org.apache.http.client.fluent.*;
{{#body}}
import org.apache.http.entity.ContentType;
{{/body}}
{{#body.has_multipart_body}}
import org.apache.http.HttpEntity;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.HttpMultipartMode;
{{/body.has_multipart_body}}

public class SendRequest
{
  public static void main(String[] args) {
    sendRequest();
  }
  
  private static void sendRequest() {
    
    // {{{request.name}}} ({{{request.method}}} {{{url.base}}})
    
    try {
      {{! ----- }}
      {{#body.has_multipart_body}}
      HttpEntity entity = MultipartEntityBuilder.create()
      .setMode(HttpMultipartMode.BROWSER_COMPATIBLE)
      {{#body.multipart_body}}
      .addTextBody("{{{name}}}", "{{{value}}}")
      {{/body.multipart_body}}
      .build();
      {{/body.has_multipart_body}}
      
      // Create request
      Content content = Request.{{{method}}}("{{{url.fullpath}}}")
      {{#headers.has_headers}}
      
      // Add headers
      {{#headers.header_list}}
      .addHeader("{{{header_name}}}", "{{{header_value}}}")
      {{/headers.header_list}}
      {{/headers.has_headers}}
      {{! ----- }}
      {{#body.has_raw_body}}
      
      // Add body
      .bodyString("{{{body.raw_body}}}", ContentType.DEFAULT_TEXT)
      {{/body.has_raw_body}}
      {{! ----- }}
      {{#body.has_long_body}}
      
      // Add body
      .bodyString("set your body string", ContentType.DEFAULT_TEXT)
      {{/body.has_long_body}}
      {{! ----- }}
      {{#body.has_url_encoded_body}}
      
      // Add body
      .bodyForm(Form.form()
      {{#body.url_encoded_body}}
      .add("{{{name}}}", "{{{value}}}")
      {{/body.url_encoded_body}}
      .build())
      {{/body.has_url_encoded_body}}
      {{! ----- }}
      {{#body.has_multipart_body}}
      
      // Add body
      .body(entity)
      {{/body.has_multipart_body}}
      {{! ----- }}
      {{#body.has_json_body}}
      
      // Add body
      .bodyString("{{{body.json_body_object}}}", ContentType.APPLICATION_JSON)
      {{/body.has_json_body}}
      
      // Fetch request and return content
      .execute().returnContent();
      
      // Print content
      System.out.println(content);
    }
    catch (IOException e) { System.out.println(e); }
  }
}`