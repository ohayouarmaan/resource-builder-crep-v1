import { readFile, readdir } from "fs/promises";
import path from "path";

/**
 * 
 * @param projectPath string
 * @returns {
 *  logic: Record<string, string>
 *  resource: {
 *      resource_type: string,
 *      config: Record<string, object>
 *  }
 * }
 */
export default async function (projectPath: string): Promise<{
    logic: Record<string, string> | null; 
    resource: {
        resource_type: string;
        config: Record<string, object>;
    };
}> {
    try {
        const files = await readdir(projectPath);
        let resource: {
            resource_type: string;
            config: Record<string, object>
        } | undefined;
        let logic: Record<string, string> | undefined;
        for (const file of files) {
            if(file != "logic.json"){
                const fileContent = await readFile(path.resolve(projectPath, file), "utf-8")
                resource = JSON.parse(fileContent);
            } else {
                const fileContent = await readFile(path.resolve(projectPath, file), "utf-8")
                logic = JSON.parse(fileContent);
            }
        }
        if(resource == undefined) throw new Error("No resource file found.");
        return {
            logic: logic || null,
            resource: resource 
        }

    } catch (e) {
        throw new Error("");
    }
}
