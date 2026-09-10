import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = 5500;
const apiKey = process.env.REST_COUNTRIES_API_KEY;
const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8"
};

const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);

    if (requestUrl.pathname === "/api/restcountries") {
        const apiUrl = requestUrl.searchParams.get("url");
        let apiRequestUrl;

        try {
            apiRequestUrl = new URL(apiUrl);
        } catch (error) {
            apiRequestUrl = null;
        }

        if (!apiRequestUrl || apiRequestUrl.origin !== "https://api.restcountries.com") {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "URL REST Countries invalide." }));
            return;
        }

        if (!apiKey) {
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "REST_COUNTRIES_API_KEY est manquante." }));
            return;
        }

        try {
            const apiResponse = await fetch(apiRequestUrl, {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            });
            response.writeHead(apiResponse.status, {
                "Content-Type": apiResponse.headers.get("content-type") ?? "application/json"
            });
            response.end(await apiResponse.text());
        } catch (error) {
            response.writeHead(502, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "REST Countries est indisponible." }));
        }

        return;
    }

    const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const filePath = resolve(join(root, normalize(`.${requestedPath}`)));

    if (!filePath.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
    }

    try {
        const content = await readFile(filePath);
        response.writeHead(200, {
            "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream"
        });
        response.end(content);
    } catch (error) {
        response.writeHead(404);
        response.end("Not found");
    }
});

server.listen(port, "127.0.0.1", () => {
    console.log(`ExploMonde disponible sur http://127.0.0.1:${port}/index.html`);
});
