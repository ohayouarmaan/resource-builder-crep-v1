import { readFile } from "fs/promises";

export default async function(resourcePath: string) {
    const fileData = await readFile(resourcePath, "utf-8");
    return JSON.parse(fileData);
}
