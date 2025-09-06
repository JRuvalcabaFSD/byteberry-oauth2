import { Container } from '@shared';

describe('Suit para probar el contenedor de inyección de dependencias', () => {
  let container = new Container();

  beforeEach(() => {
    container = new Container();
  });
  it('should register and resolve transitory units when factoring is used', () => {
    class TestService {
      private name: string = '';
      constructor() {}
      setName(name: string) {
        this.name = name;
      }
      getName(): string {
        return this.name;
      }
    }
    const TestToken = Symbol('TestService');

    container.register<TestService>(TestToken, () => new TestService());

    const instance1 = container.resolve<TestService>(TestToken);
    const instance2 = container.resolve<TestService>(TestToken);
    instance1.setName('Instance 1');
    instance2.setName('Instance 2');

    expect(instance1.getName()).toBe('Instance 1');
    expect(instance2.getName()).toBe('Instance 2');
  });
  it('The same instance should return when registered as Singleton', () => {
    class TestService {
      private name: string = '';
      constructor() {}
      setName(name: string) {
        this.name = name;
      }
      getName(): string {
        return this.name;
      }
    }
    const TestToken = Symbol('TestService');

    container.registerSingleton<TestService>(TestToken, () => new TestService());

    const instance1 = container.resolve<TestService>(TestToken);
    const instance2 = container.resolve<TestService>(TestToken);
    instance1.setName('TestService');

    expect(instance2.getName()).toBe('TestService');
    expect(instance1).toBe(instance2);
  });
  it('The pre -registered instance should return when instance is recorded', () => {
    class TestService {
      private name: string = 'TestService';
      constructor() {}
      getName(): string {
        return this.name;
      }
    }
    const preInstance = new TestService();
    const TestToken = Symbol('TestService');

    container.registerInstance<TestService>(TestToken, preInstance);

    const instance1 = container.resolve<TestService>(TestToken);
    const instance2 = container.resolve<TestService>(TestToken);

    expect(instance1.getName()).toBe('TestService');
    expect(instance1).toBe(instance2);
  });
  it('I should launch error when the token is not registered', () => {
    const TestToken = Symbol('TestService');

    expect(() => container.resolve(TestToken)).toThrow(`DI: token not registered → ${TestToken.description}`);
  });
  it('I should clean all records when Clear is invoked', () => {
    class TestService {
      constructor(private name: string) {}

      getName(): string {
        return this.name;
      }
    }
    const TestToken = Symbol('TestService');
    const instance = new TestService('TestService-Instance');

    container.registerInstance<TestService>(TestToken, instance);
    expect(container.resolve<TestService>(TestToken).getName()).toBe('TestService-Instance');

    container.clear();
    expect(() => container.resolve<TestService>(TestToken)).toThrow(`DI: token not registered → ${TestToken.description}`);
  });
});
