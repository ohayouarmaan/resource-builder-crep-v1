import InternalResource from "./internal_resource";

interface IDependency<C> {
    type: string;
    comment?: string;
    config: C
}

export default class Dependency<C> {
    public type: string;
    public config: C;
    public comment: string | undefined;
    //@ts-ignore ignore this <UNUSED ERRROR> saving this as a property because it may be required in the future.
    private parent: InternalResource<unknown>;

    constructor(dependency: IDependency<C>) {
        this.type = dependency.type;
        this.config = dependency.config
        this.comment = dependency.comment;
    }

    register_parent<IC>(parent: InternalResource<IC>) {
        this.parent = parent;
    }
}