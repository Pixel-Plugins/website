// Rewrites the marked nav/footer regions in every HTML page from the
// partials in /partials/. Source of truth lives in the partials; run
// this after editing them, review the diff, then commit.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const regions = [
    { name: "nav", partial: "partials/nav.html" },
    { name: "footer", partial: "partials/footer.html" },
    { name: "analytics", partial: "partials/analytics.html" },
];

function indentBlock(block, indent) {
    return block
        .split("\n")
        .map((line) => (line.length ? indent + line : line))
        .join("\n");
}

function findHtmlFiles(dir, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".local" || entry.name === "partials") continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) findHtmlFiles(full, out);
        else if (entry.name.endsWith(".html")) out.push(full);
    }
    return out;
}

const files = findHtmlFiles(root);

for (const file of files) {
    let content = readFileSync(file, "utf-8");
    let changed = false;

    for (const { name, partial } of regions) {
        const partialContent = readFileSync(join(root, partial), "utf-8").trimEnd();
        const startMarker = `<!-- ${name}:start -->`;
        const endMarker = `<!-- ${name}:end -->`;
        const pattern = new RegExp(
            String.raw`([ \t]*)${startMarker}\n[\s\S]*?\n[ \t]*${endMarker}`
        );
        const match = content.match(pattern);
        if (!match) continue;

        const indent = match[1];
        const replacement = `${indent}${startMarker}\n${indentBlock(partialContent, indent)}\n${indent}${endMarker}`;
        if (match[0] !== replacement) changed = true;
        content = content.replace(pattern, replacement);
    }

    if (changed) {
        writeFileSync(file, content, "utf-8");
        console.log("synced", file.replace(root + "/", ""));
    }
}
