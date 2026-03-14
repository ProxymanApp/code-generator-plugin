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

const bodyTransform = function (request) {
  var json_body, multipart_body, name, raw_body, url_encoded_body, value;
  json_body = request.jsonBody;
  if (json_body) {
    return {
      has_body: true,
      has_json_body: true,
      json_body_raw: JSON.stringify(json_body, null, 4),
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
  const body = bodyTransform(request);
  const _uri = URI(request.url);
  _uri.search("");
  const view = {
    request: request,
    method: request.method.toUpperCase(),
    method_lower: request.method.toLowerCase(),
    url: url,
    headers: headersTransform(request),
    body: body,
    headline: `${request.method.toUpperCase()} ${_uri.toString()}`,
    version: metadata.version,
  };
  return Mustache.render(codeTemplate, view);
};

const metadata = {
  name: "Kotlin OkHttp",
  fileExtension: "kt",
  identifier: "com.proxyman.plugin.KotlinOkHttpCodeGenerator",
  author: "Proxyman",
  version: "1.0.0",
};

const codeTemplate = `import okhttp3.OkHttpClient
import okhttp3.Request
{{#body.has_json_body}}
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
{{/body.has_json_body}}
{{#body.has_url_encoded_body}}
import okhttp3.FormBody
{{/body.has_url_encoded_body}}
{{#body.has_multipart_body}}
import okhttp3.MultipartBody
{{/body.has_multipart_body}}
{{#body.has_raw_body}}
import okhttp3.RequestBody.Companion.toRequestBody
{{/body.has_raw_body}}

// Proxyman Code Generator ({{{version}}}): Kotlin + OkHttp
// {{{headline}}}

val client = OkHttpClient()
{{#body.has_json_body}}

val mediaType = "application/json".toMediaType()
val body = """
    {{{body.json_body_raw}}}
""".trimIndent().toRequestBody(mediaType)
{{/body.has_json_body}}
{{#body.has_url_encoded_body}}

val body = FormBody.Builder()
{{#body.url_encoded_body}}
    .add("{{{name}}}", "{{{value}}}")
{{/body.url_encoded_body}}
    .build()
{{/body.has_url_encoded_body}}
{{#body.has_multipart_body}}

val body = MultipartBody.Builder()
    .setType(MultipartBody.FORM)
{{#body.multipart_body}}
    .addFormDataPart("{{{name}}}", "{{{value}}}")
{{/body.multipart_body}}
    .build()
{{/body.has_multipart_body}}
{{#body.has_raw_body}}

val body = "{{{body.raw_body}}}".toRequestBody()
{{/body.has_raw_body}}

val request = Request.Builder()
    .url("{{{url.fullpath}}}")
{{#body.has_body}}
    .{{{method_lower}}}(body)
{{/body.has_body}}
{{^body.has_body}}
    .{{{method_lower}}}()
{{/body.has_body}}
{{#headers.has_headers}}
{{#headers.header_list}}
    .addHeader("{{{header_name}}}", "{{{header_value}}}")
{{/headers.header_list}}
{{/headers.has_headers}}
    .build()

val response = client.newCall(request).execute()
println(response.body?.string())
`;
