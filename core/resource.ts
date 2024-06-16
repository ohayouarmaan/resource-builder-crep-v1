class Resource {
  public type: string;
  public config: Record<string, object>;
  constructor(type: string, config: Record<string, object>) {
    this.type = type;
    this.config = config;
  }
}

export default Resource;
