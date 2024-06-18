import { readFile, readdir } from "fs/promises";
import Resource from "./resource";
import Logic from "./logic";
import path from "node:path";
import { IDependency, ILogicDependency } from "../types/core/dependency.types";

class Project {
  public name: string;
  public resource: Resource;
  public logic: Record<string, Logic>;
  public dependencies?: IDependency<unknown>[];

  constructor(name: string, resource: Resource, logic: Record<string, Logic>, dependencies?: IDependency<unknown>[]) {
    this.name = name;
    this.resource = resource;
    this.logic = logic;
    this.dependencies = dependencies;
  }

  getDependency(id: string): IDependency<unknown> {
    let foundDependency: IDependency<unknown> | undefined;
    this.dependencies?.forEach(dependency => {
      if(dependency.id == id) {
        foundDependency = dependency
      }
    });
    if(foundDependency != undefined) {
      return foundDependency;
    } else {
      throw new Error("No such dependency found.");
    }
  }

  static async readDirectory(projectPath: string) {
    try {
      const files = await readdir(projectPath);
      let resource:
        | {
            resource_type: string;
            config: Record<string, object>;
            dependencies: IDependency<unknown>[];
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
          const _logic = JSON.parse(fileContent) as Record<string, {
            code: string;
            dependencies: ILogicDependency[]
          }>;
          for (const logic_name of Object.keys(_logic)) {
            const current_dependencies: IDependency<unknown>[] = [];
            _logic[logic_name].dependencies.map(dep => {
              resource?.dependencies.map(resource_dependency => {
                if(dep.id == resource_dependency.id) {
                  current_dependencies.push(resource_dependency);
                }
              })
            })
            const l = new Logic(_logic[logic_name].code, _logic[logic_name].dependencies);
            l.injectDependencies(current_dependencies);
            logic[logic_name] = l
          }
        }
      }
      if (resource == undefined) throw new Error("No resource file found.");
      const p = new Project(
        projectPath.split("/")[projectPath.split("/").length - 1],
        new Resource(resource.resource_type, resource.config),
        logic,
        resource.dependencies,
      );
      
      return p;
    } catch (e) {
      throw new Error("No such project exists.");
    }
  }

  async runResource() {
    this.resource.run(this.logic);
  }
}

export default Project;
