export default abstract class InternalResource<C> {
  abstract run(): void;
  abstract register_config(config: C): void;
  // The below method should be able to get all the dependencies from the resource (if any) and then install it in the main resource.
  // abstract resolve_dependencies(): void;
}
