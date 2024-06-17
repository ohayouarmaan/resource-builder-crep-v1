export default abstract class InternalResource<C> {
    abstract run(): void;
    abstract register_config(config: C): void;
}