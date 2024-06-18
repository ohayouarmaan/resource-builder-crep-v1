import { IDependency } from "../types/core/dependency.types";
import InternalResource from "./internal_resource";
import Logic from "./logic";
import { IServerConfig } from "./plugins/server.plugin";

class Resource {
  public type: string;
  public config: Record<string, object>;
  constructor(type: string, config: Record<string, object>) {
    this.type = type;
    this.config = config;
  }
  async run(logic: Record<string, Logic>) {
    switch (this.type) {
      case "express":
        await this.createServerResource(logic);
        break;

      default:
        break;
    }
  }

  async createServerResource(logic: Record<string, Logic>) {
    // using this will result in lazily loading a resource
    const { default: ServerClass } = await import("./plugins/server.plugin");
    const server = new ServerClass(logic);
    server.register_config(this.config as unknown as IServerConfig);
    server.run();
  }
}

export default Resource;
