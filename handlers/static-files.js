const url = require("url");
const fs = require("fs");
const getContentType = require("./getContentType");

// function getContentType(url) {
//     if (url.endsWith("css")) {
//         return "text/css";
//     } else if (url.endsWith("html")) {
//         return "text/html";
//     } else if (url.endsWith("png")) {
//         return "image/png";
//     } else if (url.endsWith("jpg")) {
//         return "image/jpeg";
//     } else if (url.endsWith("js")) {
//         return "text/javascript";
//     } else if (url.endsWith("json")) {
//         return "application/json";
//     } else {
//         return "text/plain";
//     }
// }

module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname.startsWith("/content") && req.method === "GET") {
        if (pathname.endsWith("png") || pathname.endsWith("jpg") || pathname.endsWith("jpeg") || pathname.endsWith("ico") && req.method === "GET") {
            fs.readFile(`./${pathname}`, (error, data) => {
                if (error) {
                    console.log(error);
                    res.writeHead(404, {
                        "Content-Type": "text/plain"
                    });
                    res.write("404 Not Found!!!\n");
                    res.end();
                    return;
                }
                // console.log(pathname);
                res.writeHead(200, {
                    "Content-Type": getContentType(pathname)
                });
                res.write(data);
                res.end();
            });
        } else {
            fs.readFile(`./${pathname}`, "utf-8", (error, data) => {
                if (error) {
                    console.log(error);
                    res.writeHead(404, {
                        "Content-Type": "text/plain"
                    });
                    res.write("404 Not Found!!!\n");
                    res.end();
                    return;
                }
                // console.log(pathname);
                res.writeHead(200, {
                    "Content-Type": getContentType(pathname)
                });
                res.write(data);
                res.end();
            });
        }
    } else {
        return true;
    }
}