import { readFile, readdir } from "fs/promises";
import path from "path";

/**
 *
 * @param projectPath string
 * @returns project obejct
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
    let resource:
      | {
          resource_type: string;
          config: Record<string, object>;
        }
      | undefined;
    let logic: Record<string, string> | undefined;
    for (const file of files) {
      const fileContent = await readFile(
        path.resolve(projectPath, file),
        "utf-8",
      );
      if (file != "logic.json") {
        resource = JSON.parse(fileContent);
      } else {
        logic = JSON.parse(fileContent);
      }
    }
    if (resource == undefined) throw new Error("No resource file found.");
    return {
      logic: logic || null,
      resource: resource,
    };
  } catch (e) {
    throw new Error("");
  }
}
