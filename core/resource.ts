import Logic from "./logic";
import { IServerConfig } from "./server";

abstract class InternalResource {
  //TODO: DECIDE ON PROPERTIES WHICH A RESOURCE SHOULD HAVE!!
}

class Resource {
  public type: string;
  public config: Record<string, object>;
  constructor(type: string, config: Record<string, object>) {
    this.type = type;
    this.config = config;
  }
  async run(logic: Record<string, Logic>) {
    //TODO: Add a simple switch case which will check the resource type and create and run the resource accordingly, also make sure
    //to make it memory effecient do not make it so that a lot of useless objects are created which are not needed at all.
    //we can lazily import the functions, based on the resourceType to make sure that we are not creating memory overhead if not needed.
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
    const { default: ServerClass } = await import("./server");
    const server = new ServerClass(logic);
    server.register_config(this.config as unknown as IServerConfig);
  }
}

export default Resource;
