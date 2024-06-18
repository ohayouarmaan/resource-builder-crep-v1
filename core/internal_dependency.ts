export default interface InternalDependency {
    connect(): Promise<void>;
}