import { IDependency, ILogicDependency } from "../types/core/dependency.types";
import Dependency from "./dependency";

class Logic {
  public logic_code: string;
  public logic_function: Function | undefined;
  public dependenciesId?: ILogicDependency[];
  public dependencies?: Record<string, Dependency<unknown, unknown>>;

  constructor(logic_code: string, dependencies?: ILogicDependency[]) {
    this.logic_code = logic_code;
    this.dependenciesId = dependencies;
  }

  public injectDependencies(dependencies: Record<string, Dependency<unknown, unknown>>) {
    this.dependencies = dependencies;
  }

  get_logic(): Function {
    if (this.logic_function != undefined) return this.logic_function;
    try {
      let func: Function = new Function(`return (${this.logic_code})`)();
      const objectToBind = {
        dependencies: this.dependencies,
      }
      func = func.bind(objectToBind);
      this.logic_function = func;
      return func;
    } catch (error) {
      console.error(error);
      throw new Error((error as Error).message);
    }
  }
}

export default Logic;
