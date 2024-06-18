export interface IDependency<C> {
  type: string;
  comment?: string;
  id: string;
  config: C;
}

export interface ILogicDependency {
    id: string;
}