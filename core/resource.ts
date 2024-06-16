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
  async run() {
    switch (this.type) {
      case "express":
        await this.createServerResource();
        break;
    
      default:
        break;
    }
  }

  async createServerResource() {

  }
}

export default Resource;
