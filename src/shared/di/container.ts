export type Factory<T> = (c: Container) => T;

export class Container {
  private factories = new Map<symbol, Factory<unknown>>();
  private singletons = new Map<symbol, Factory<unknown>>();
  private instances = new Map<symbol, unknown>();
  private cache = new Map<symbol, unknown>();

  register<T>(token: symbol, factory: Factory<T>): void {
    this.factories.set(token, factory as Factory<unknown>);
  }
  registerSingleton<T>(token: symbol, factory: Factory<T>): void {
    this.singletons.set(token, factory as Factory<unknown>);
  }
  registerInstance<T>(token: symbol, instance: T): void {
    this.instances.set(token, instance as unknown);
  }
  resolve<T>(token: symbol): T {
    if (this.instances.has(token)) return this.instances.get(token) as T;
    if (this.cache.has(token)) return this.cache.get(token) as T;
    const singleton = this.singletons.get(token);
    if (singleton) {
      const build = singleton(this) as T;
      this.cache.set(token, build);
      return build;
    }

    const factory = this.factories.get(token);
    if (factory) return factory(this) as T;

    const name = token.description || token.toString();
    throw new Error(`DI: token not registered → ${name}`);
  }

  has(token: symbol): boolean {
    return this.instances.has(token) || this.cache.has(token) || this.singletons.has(token) || this.factories.has(token);
  }

  clear(): void {
    this.factories.clear();
    this.singletons.clear();
    this.instances.clear();
    this.cache.clear();
  }
}
