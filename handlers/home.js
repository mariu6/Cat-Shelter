const url = require("url");
const fs = require("fs");
const path = require("path");
const cats = require("../data/cats.json");
const qs = require("querystring");

let filePath = path.normalize(
    path.join(__dirname, "../views/home/index.html")
);

module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname === "/" && req.method === "GET") {
        fs.readFile(filePath, (error, data) => {
            console.log(pathname);
            if (error) {
                console.log(error);
                res.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                res.write("404 Not Found!!!\n");
                res.end();
                return;
            }
            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            let modifiedCats = cats.reduce((a, cat) => {
                if (cat.taken === false) {
                    return a + `<li>
                    <img src="${path.join('./content/images/' + cat.image)}" alt="${cat.name}">
                    <h3>${cat.name}</h3>
                    <p><span>Breed: </span>${cat.breed}</p>
                    <p><span>Description: </span>${cat.description}</p>
                    <ul class="buttons">
                        <li class="btn edit"><a href="/cats-edit/${cat.id}">Change Info</a></li>
                        <li class="btn delete"><a href="/cats-find-new-home/${cat.id}">New Home</a></li>
                    </ul>
                </li>`}
                return a;
            }, "");
            let modifiedData = data.toString().replace('{{cats}}', modifiedCats);
            res.write(modifiedData);
            res.end();
        });

    } else if (pathname === "/" && req.method === "POST") {
        let searchCriteria = "";
        let formData = "";
        req.on("data", (data) => {
            formData += data;
        });
        req.on("end", () => {
            searchCriteria = qs.parse(formData);
        });

        fs.readFile(filePath, (error, data) => {
            console.log(pathname);
            if (error) {
                console.log(error);
                res.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                res.write("404 Not Found!!!\n");
                res.end();
                return;
            }
            res.writeHead(200, {
                "Content-Type": "text/html"
            });
            let modifiedCats = cats.reduce((a, cat) => {
                cat.name = cat.name.toLocaleLowerCase();
                cat.breed = cat.breed.toLocaleLowerCase();
                if (cat.taken === false && (cat.name.includes(searchCriteria.search) || cat.breed.includes(searchCriteria.search))) {
                    return a + `<li>
                    <img src="${path.join('./content/images/' + cat.image)}" alt="${cat.name}">
                    <h3>${cat.name}</h3>
                    <p><span>Breed: </span>${cat.breed}</p>
                    <p><span>Description: </span>${cat.description}</p>
                    <ul class="buttons">
                        <li class="btn edit"><a href="/cats-edit/${cat.id}">Change Info</a></li>
                        <li class="btn delete"><a href="/cats-find-new-home/${cat.id}">New Home</a></li>
                    </ul>
                </li>`}
                return a;
            }, "");
            let modifiedData = data.toString().replace('{{cats}}', modifiedCats);
            res.write(modifiedData);
            res.end();
        });
    } else {
        return true;
    }
}
