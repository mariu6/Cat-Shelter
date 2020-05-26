const url = require("url");
const fs = require("fs");
const path = require("path");
const qs = require("querystring");
const formidable = require("formidable");    // 3rd party
const breedsFile = require("../data/breeds.json");
const catsFile = require("../data/cats.json");

module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;
    console.log(pathname);
    if (pathname === "/cats/add-cat" && req.method === "GET") {

        let filePath = path.normalize(path.join(__dirname, "../views/addCat.html"));
        const input = fs.createReadStream(filePath);   // fs.readFile() can be used as well

        input.on("data", (data) => res.write(data));
        input.on("end", () => res.end());
        input.on("error", (err) => console.log(err));

    } else if (pathname === "/cats/add-breed" && req.method === "GET") {
        let filePath = path.normalize(path.join(__dirname, "../views/addBreed.html"));
        const input = fs.createReadStream(filePath);   // fs.readFile() can be used as well

        input.on("data", (data) => res.write(data));
        input.on("end", () => res.end());
        input.on("error", (err) => console.log(err));

    } else if (pathname === "/cats/add-breed" && req.method === "POST") {

        let filePath = path.normalize(path.join(__dirname, "./data/breeds.json"));
        console.log(filePath);
        let formData = "";                                             // 1. Parse the incoming data from the form
        req.on("data", (data) => {
            console.log(data);
            formData += data;
        });
        req.on("end", () => {
            let body = qs.parse(formData);
            console.log(body);
            fs.readFile(filePath, (err, data) => {         // 2. Read the breeds.json file
                if (err) {
                    console.log("Error: ", err);
                    return;
                }
                let breeds = JSON.parse(data);
                console.log(body.breed);
                breeds.push(body.breed);                               // 3. Modify the breeds.json file
                let json = JSON.stringify(breeds);
                fs.writeFile(filePath, json, () => console.log("The breed was uploaded successfully!"));                                                     // 4. Update the breeds.json file
            });

            res.writeHead(200, { "location": "/" });                      // 5. Redirect to the home page ('/') and end the response
            res.end();
        });

    } else if (pathname === "/cats/add-cat" && req.method === "POST") {


    } else {
        return true;
    }
};



// const url = require('url');
// const fs = require('fs');
// const path = require('path');
// const qs = require('querystring');
// const breeds = require('../data/breeds.json');

// module.exports = (req, res) => {
//     const pathname = url.parse(req.url).pathname;
// console.log(pathname);
//     if (pathname === '/cats/add-breed' && req.method === 'GET') { //BREEDS
//         const filePath = path.normalize(
//             path.join(__dirname, `../views/addBreed.html`));

//         fs.readFile(filePath, 'utf-8', (err, data) => {
//             if (err) {
//                 console.error(err);
//                 res.writeHead(404, { 'Content-Type': 'text/plain' });
//                 res.write('File not found.');
//                 res.end();
//                 return
//             }

//             res.writeHead(200, { 'Content-Type': 'text/html' });
//             res.write(data);
//             res.end();
//         });

//     } else if (pathname === '/cats/add-breed' && req.method === 'POST') {
//         let body = '';
//         req.on('data', function (data) {
//             body += data;

//             if (body.length > 1e6)
//                 req.connection.destroy();
//         });

//         req.on('end', function () {
//             const post = qs.parse(body);
//             const filePath = path.normalize(
//                 path.join(__dirname, `../data/breeds.json`));


//             fs.readFile(filePath, 'utf-8', (err, data) => {
//                 if (err) {
//                     console.error(err);
//                     res.writeHead(404, { 'Content-Type': 'text/plain' });
//                     res.write('File not found.');
//                     res.end();
//                     return
//                 }

//                 const tmp = JSON.parse(data);
//                 tmp.push(post.breed);

//                 fs.writeFileSync(filePath, JSON.stringify(tmp));
//                 res.writeHead(301, { "Location": "/" });
//                 return res.end();
//             });
//         });
//     } else if (pathname === '/cats/add-cat' && req.method === 'GET') { //CATS
//         const filePath = path.normalize(
//             path.join(__dirname, `../views/addCat.html`));

//         fs.readFile(filePath, 'utf-8', (err, data) => {
//             if (err) {
//                 console.error(err);
//                 res.writeHead(404, { 'Content-Type': 'text/plain' });
//                 res.write('File not found.');
//                 res.end();
//                 return
//             }

//             res.writeHead(200, { 'Content-Type': 'text/html' });

//             const breedOptions = breeds.map(breed => {
//                 return `<option value="${breed}">${breed}</option>`
//             });


//             const modifiedData = data.toString()
//                 .replace('{{catBreeds}}', breedOptions);

//             res.write(modifiedData);
//             res.end();
//         });

//     } else if (pathname === '/cats/add-cat' && req.method === 'POST') {
//         let body = '';
//         req.on('data', function (data) {
//             body += data;

//             if (body.length > 1e6)
//                 req.connection.destroy();
//         });

//         req.on('end', function () {
//             const post = qs.parse(body);
//             const filePath = path.normalize(
//                 path.join(__dirname, `../data/cats.json`));


//             fs.readFile(filePath, 'utf-8', (err, data) => {
//                 if (err) {
//                     console.error(err);
//                     res.writeHead(404, { 'Content-Type': 'text/plain' });
//                     res.write('File not found.');
//                     res.end();
//                     return
//                 }
//                 const tmp = JSON.parse(data);
//                 tmp.push(
//                     {
//                         id: tmp.length,
//                         name: post.name,
//                         description: post.description,
//                         upload: post.upload,
//                         breed: post.breed,
//                     }
//                 );

//                 fs.writeFileSync(filePath, JSON.stringify(tmp));
//                 res.writeHead(301, { "Location": "/" });
//                 return res.end();
//             });
//         });
//     } else {
//         return true
//     }
// }