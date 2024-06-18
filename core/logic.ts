import { IDependency, ILogicDependency } from "../types/core/dependency.types";
import Project from "./project";

class Logic {
  public logic_code: string;
  public logic_function: Function | undefined;
  public dependenciesId?: ILogicDependency[];
  public dependencies?: IDependency<unknown>[];

  constructor(logic_code: string, dependencies?: ILogicDependency[]) {
    this.logic_code = logic_code;
    this.dependenciesId = dependencies;
  }

  public injectDependencies(dependencies: IDependency<unknown>[]) {
    this.dependencies = dependencies;
  }

  get_logic(): Function {
    if (this.logic_function != undefined) return this.logic_function;
    try {
      const func = new Function(`return (${this.logic_code})`)();
      //TODO: Loop over the dependencies and somehow get the dependencies from the parent and make an object which contains
      //all the dependencies which then can be used to bind this function to, so that the logic code can use it.
      this.dependencies?.map(dependency => {
        // fetch the dependency from the resource somehow

      });
      this.logic_function = func;
      return func;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}

export default Logic;
