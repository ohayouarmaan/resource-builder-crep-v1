import { readFile, readdir } from "fs/promises";
import Resource from "./resource";
import Logic from "./logic";
import path from "node:path";
import { IDependency, ILogicDependency } from "../types/core/dependency.types";
import Dependency from "./dependency";
import InternalDependency from "./internal_dependency";

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
      const created_dependencies = await readdir(path.resolve(__dirname, "./dependencies"));
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
        }
      }
      for(const file of files) {
        const fileContent = await readFile(
          path.resolve(projectPath, file),
          "utf-8",
        );
        if(file == "logic.json") {
          const _logic = JSON.parse(fileContent) as Record<string, {
            code: string;
            dependencies?: ILogicDependency[]
          }>;
          const resolved_dependencies: Record<string, Dependency<unknown, unknown>> = {};
          for (const logic_name of Object.keys(_logic)) {
            const current_dependencies: Record<string, Dependency<unknown, unknown>> = {};
            _logic[logic_name].dependencies?.map(dep => {
              resource?.dependencies.map(async resource_dependency => {
                if(!Object.keys(resolved_dependencies).includes(resource_dependency.id)) {
                  for(const created_dependency of created_dependencies) {
                    if(created_dependency.split(".")[0] == resource_dependency.type) {
                      const { default: InitializeDependency } : {
                        default: typeof Dependency & (new (...args: any[]) => InternalDependency)
                      } = await import(path.resolve(__dirname, "./dependencies", created_dependency));
                      const d = new InitializeDependency(resource_dependency);
                      await d.connect();
                      resolved_dependencies[resource_dependency.id] = d;
                    }

                  }
                }
                if(dep.id == resource_dependency.id) {
                  current_dependencies[resource_dependency.id] = (resolved_dependencies[resource_dependency.id]);
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
      console.error(e);
      throw new Error("No such project exists.");
    }
  }

  async runResource() {
    this.resource.run(this.logic);
  }
}

export default Project;
