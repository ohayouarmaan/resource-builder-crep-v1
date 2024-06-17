import InternalResource from "./internal_resource";

interface IDependency<C> {
  type: string;
  comment?: string;
  id: string;
  config: C;
}

//TODO: Add an ID field which can be reffered by logic to use this dependency which should be resolved in the Logic class.
//we can loop through the dependencies required in the logic and add an object which we can bind to the logic function so that the
//user can use the required dependencies as an object.
export default class Dependency<C, T> {
  public type: string;
  public config: C;
  public comment: string | undefined;
  //@ts-ignore ignore this <UNUSED ERRROR> saving this as a property because it may be required in the future.
  private parent: InternalResource<unknown>;
  public core: T | undefined;
  readonly id: string;

  constructor(dependency: IDependency<C>) {
    this.type = dependency.type;
    this.config = dependency.config;
    this.id = dependency.id;
    this.comment = dependency.comment;
  }

  // Registers the parent resource, just in case we might need to use it somehow.
  register_parent<IC>(parent: InternalResource<IC>) {
    this.parent = parent;
  }

  async create_core(cb: (x: Dependency<C, T>) => Promise<T>) {
    this.core = await cb(this);
  }
}
