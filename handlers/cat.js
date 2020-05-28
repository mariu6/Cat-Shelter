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

        input.on("data", (data) => {
            let catBreedPlaceholder = breedsFile.map((breed) => `<option value="${breed}">${breed}</option>`).join("");    // It acts like 
            let modifiedData = data.toString().replace('{{catBreeds}}', catBreedPlaceholder);                              // proto handlebars 
            res.write(modifiedData);
        });
        input.on("end", () => res.end());
        input.on("error", (err) => console.log(err));

    } else if (pathname === "/cats/add-breed" && req.method === "GET") {
        let filePath = path.normalize(path.join(__dirname, "../views/addBreed.html"));
        const input = fs.createReadStream(filePath);   // fs.readFile() can be used as well

        input.on("data", (data) => res.write(data));
        input.on("end", () => res.end());
        input.on("error", (err) => console.log(err));

    } else if (pathname === "/cats/add-breed" && req.method === "POST") {     // 0. Fill the HTML with action="/cats/add-breed" method="POST"
        console.log("opo");
        let filePath = path.normalize(path.join(__dirname, "../data/breeds.json"));
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
                let json = JSON.stringify(breeds.sort());
                fs.writeFile(filePath, json, () => console.log("The breed was uploaded successfully!"));                                                     // 4. Update the breeds.json file
            });

            res.writeHead(301, { "location": "/" });                      // 5. Redirect to the home page ('/') and end the response
            res.end();
        });

    } else if (pathname === "/cats/add-cat" && req.method === "POST") {
        let form = new formidable.IncomingForm();           // form is used for processing various form data 
        form.parse(req, (err, fields, files) => {           // fields - passing info from form fields, files - from preset formidable
            if (err) throw err;

            // move of the uploaded file (in this case - picture)
            let oldPath = files.upload.path;                         // taking them from the default formidable folder
            let newPath = path.normalize(path.join(__dirname, "../content/images/" + files.upload.name));  // creating new path in my folder
            fs.rename(oldPath, newPath, (err) => {                   // transfer     
                if (err) throw err;
                console.log("Files was uploaded sccessfully!");
            });

            // Add new object to cats.json
            fs.readFile("./data/cats.json", "utf-8", (err, data) => {
                if (err) throw err;
                let allCats = JSON.parse(data);                         // parsing to array of objects
                allCats.push({ id: catsFile.length + 1, ...fields, image: files.upload.name });   // constructing and adding the new object
                let json = JSON.stringify(allCats);                     // set back to JSON
                fs.writeFile("./data/cats.json", json, () => {          // rewrite the original file with the new cat info
                    res.writeHead(301, { location: "/" });              // redirect
                    res.end();
                })
            })
        })

    } else if (pathname.includes("/cats-edit") && req.method === "GET") {
        let filePath = path.normalize(path.join(__dirname, "../views/editCat.html"));
        const input = fs.createReadStream(filePath);   // fs.readFile() can be used as well
        const currentCat = catsFile[Number(pathname.match(/\d+$/g)) - 1];
        console.log(currentCat);
        input.on("data", (data) => {
            let modifiedData = data.toString().replace('{{id}}', currentCat.id);
            console.log(currentCat.name);
            modifiedData = modifiedData.toString().replace('{{name}}', currentCat.name);
            modifiedData = modifiedData.toString().replace('{{description}}', currentCat.description);

            const breedsAsOptions = breedsFile.map((b) => `<option value="${b}">${b}</option>`);
            modifiedData = modifiedData.replace("{{catBreeds}}", breedsAsOptions.join("/"));

            modifiedData = modifiedData.replace("{{breed}}", currentCat.breed);
            res.write(modifiedData);
        });
        input.on("end", () => res.end());
        input.on("error", (err) => console.log(err));

    } else if (pathname.includes("/cats-edit") && req.method === "POST") {     // similiar logic to Add Cat
        const catId = Number(pathname.match(/\d+$/g)) - 1;
        // console.log(catId);
        let form = new formidable.IncomingForm();           // form is used for processing various form data 

        form.parse(req, (err, fields, files) => {           // fields - passing info from form fields, files - from preset formidable
            if (err) throw err;
            let filesUploadName;
            if (!!files.upload.name) {          // check if during edit there is a new picture file. If not - it will be empty
                // move of the uploaded file (in this case - picture)
                let oldPath = files.upload.path;                         // taking them from the default formidable folder
                let newPath = path.normalize(path.join(__dirname, "../content/images/" + files.upload.name));  // creating new path in my folder
                fs.rename(oldPath, newPath, (err) => {                   // transfer     
                    if (err) throw err;
                    console.log("Files was uploaded sccessfully!");
                });
                filesUploadName = files.upload.name;
            } else {
                filesUploadName = undefined;
            }

            // Add new object to cats.json
            fs.readFile("./data/cats.json", "utf-8", (err, data) => {
                if (err) throw err;
                let allCats = JSON.parse(data);                         // parsing to array of objects
                console.log(allCats);
                console.log(fields);
                allCats[catId] = { id: catId + 1, ...fields, image: filesUploadName };   // constructing and replacing the object
                let json = JSON.stringify(allCats);                     // set back to JSON
                fs.writeFile("./data/cats.json", json, () => {          // rewrite the original file with the new cat info
                    res.writeHead(301, { location: "/" });              // redirect
                    res.end();
                })
            })
        })
    } else if (pathname.includes("/cats-find-new-home") && req.method === "GET") {
        let filePath = path.normalize(path.join(__dirname, "../views/catShelter.html"));
        const input = fs.createReadStream(filePath);  
        const currentCat = catsFile[Number(pathname.match(/\d+$/g)) - 1];
        console.log(currentCat);
        input.on("data", (data) => {
            console.log(currentCat.name + "     " + currentCat.id);
            let modifiedData = data.toString().replace('{{id}}', currentCat.id);
            modifiedData = modifiedData.toString().replace('{{name}}', currentCat.name);
            modifiedData = modifiedData.toString().replace('{{description}}', currentCat.description);
            modifiedData = modifiedData.toString().replace('{{image}}', currentCat.image);
            const breedsAsOptions = breedsFile.map((b) => `<option value="${b}">${b}</option>`);
            modifiedData = modifiedData.replace("{{catBreeds}}", breedsAsOptions.join("/"));

            modifiedData = modifiedData.replace("{{breed}}", currentCat.breed);
            res.write(modifiedData);
        });
        input.on("end", () => res.end());
        input.on("error", (err) => console.log(err));

    } else if (pathname.includes("/cats-find-new-home") && req.method === "POST") {     // similiar logic to Add Cat
        const catId = Number(pathname.match(/\d+$/g)) - 1;
        // console.log(catId);
        let form = new formidable.IncomingForm();           // form is used for processing various form data 

        form.parse(req, (err, fields, files) => {           // fields - passing info from form fields, files - from preset formidable
            if (err) throw err;
            let filesUploadName;
            if (!!files.upload.name) {          // check if during edit there is a new picture file. If not - it will be empty
                // move of the uploaded file (in this case - picture)
                let oldPath = files.upload.path;                         // taking them from the default formidable folder
                let newPath = path.normalize(path.join(__dirname, "../content/images/" + files.upload.name));  // creating new path in my folder
                fs.rename(oldPath, newPath, (err) => {                   // transfer     
                    if (err) throw err;
                    console.log("Files was uploaded sccessfully!");
                });
                filesUploadName = files.upload.name;
            } else {
                filesUploadName = undefined;
            }

            // Add new object to cats.json
            fs.readFile("./data/cats.json", "utf-8", (err, data) => {
                if (err) throw err;
                let allCats = JSON.parse(data);                         // parsing to array of objects
                console.log(allCats);
                console.log(fields);
                allCats[catId] = { id: catId + 1, ...fields, image: filesUploadName };   // constructing and replacing the object
                let json = JSON.stringify(allCats);                     // set back to JSON
                fs.writeFile("./data/cats.json", json, () => {          // rewrite the original file with the new cat info
                    res.writeHead(301, { location: "/" });              // redirect
                    res.end();
                })
            })
        })

    } else {
        return true;
    }
};


