import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import http from "http";

const isServe = process.argv.includes("--serve");

async function build() {
  console.log("Building Quantum Explainer standalone website...");

  try {
    const result = await esbuild.build({
      entryPoints: ["src/main.jsx"],
      bundle: true,
      write: false,
      outfile: "dist/bundle.js",
      format: "iife",
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      minify: true,
      loader: {
        ".jsx": "jsx",
        ".js": "js",
        ".css": "css",
      },
    });

    let jsContent = "";
    let cssContent = "";

    for (const file of result.outputFiles) {
      if (file.path.endsWith(".js")) {
        jsContent += file.text;
      } else if (file.path.endsWith(".css")) {
        cssContent += file.text;
      }
    }

    const htmlTemplate = `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quantum Explainer &mdash; How quantum computing actually works, from first principles</title>
  <meta name="description" content="An interactive web explainer that teaches how quantum computing actually works, from first principles. Twelve short modules ending in interactive instruments.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
${jsContent}
  </script>
</body>
</html>`;

    fs.writeFileSync("index.html", htmlTemplate, "utf8");
    console.log("Success: Standalone index.html generated successfully!");
    console.log("File size:", Math.round(Buffer.byteLength(htmlTemplate) / 1024), "KB");
    console.log("You can open index.html directly in any browser without needing a dev server.");
  } catch (err) {
    console.error("Build failed:", err);
    process.exit(1);
  }
}

if (isServe) {
  await build();
  const PORT = 3000;
  const server = http.createServer((req, res) => {
    let filePath = "." + req.url;
    if (filePath === "./") filePath = "./index.html";

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
      } else {
        const ext = path.extname(filePath);
        let contentType = "text/html";
        if (ext === ".js") contentType = "text/javascript";
        if (ext === ".css") contentType = "text/css";
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`Development server running at http://localhost:${PORT}/`);
    console.log("(Note: You do not need this server to run the website; index.html works directly via file://)");
  });
} else {
  build();
}
