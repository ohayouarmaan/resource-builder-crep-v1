import { readFile, readdir } from "fs/promises";
import Resource from "./resource";
import path from "node:path";

class Project {
  public name: string;
  public resource: Resource;
  public logic: Record<string, string> | null;

  constructor(
    name: string,
    resource: Resource,
    logic: Record<string, string> | null,
  ) {
    this.name = name;
    this.resource = resource;
    this.logic = logic;
  }

  static async readDirectory(projectPath: string) {
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
      return new Project(
        projectPath.split("/")[projectPath.split("/").length - 1],
        new Resource(resource.resource_type, resource.config),
        logic || null,
      );
    } catch (e) {
      throw new Error("No such project exists.");
    }
  }

  async createResource() {

  }
}

export default Project;
