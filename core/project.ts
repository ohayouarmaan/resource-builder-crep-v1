import { readFile, readdir } from "fs/promises";
import Resource from "./resource";
import Logic from "./logic";
import path from "node:path";

class Project {
  public name: string;
  public resource: Resource;
  public logic: Record<string, Logic>;

  constructor(name: string, resource: Resource, logic: Record<string, Logic>) {
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
      let logic: Record<string, Logic> = {};
      for (const file of files) {
        const fileContent = await readFile(
          path.resolve(projectPath, file),
          "utf-8",
        );
        if (file != "logic.json") {
          resource = JSON.parse(fileContent);
        } else {
          const _logic = JSON.parse(fileContent) as Record<string, string>;
          for (const logic_name of Object.keys(_logic)) {
            logic[logic_name] = new Logic(_logic[logic_name]);
          }
        }
      }
      if (resource == undefined) throw new Error("No resource file found.");
      return new Project(
        projectPath.split("/")[projectPath.split("/").length - 1],
        new Resource(resource.resource_type, resource.config),
        logic,
      );
    } catch (e) {
      throw new Error("No such project exists.");
    }
  }

  async runResource() {
    this.resource.run(this.logic);
  }
}

export default Project;
