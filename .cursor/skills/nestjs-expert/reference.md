# NestJS Expert — Reference

## Clean / Hexagonal / DDD in NestJS

```
features/orders/
├── orders.module.ts          # Composition root
├── orders.controller.ts      # Driving adapter (HTTP)
├── orders.service.ts         # Application / use-case layer
├── orders.repository.ts      # Driven adapter (persistence)
├── dto/                      # Input/output contracts
├── domain/                   # Optional: entities, value objects, domain services
└── ports/                    # Optional: interfaces for external systems
```

- **Ports:** TypeScript interfaces (`IOrderRepository`, `IPaymentGateway`) injected via custom providers.
- **Adapters:** Concrete NestJS classes implementing ports (`OrdersRepository`, `StripePaymentAdapter`).
- **Domain:** Pure TypeScript — no Nest decorators; testable without framework.

## Dynamic modules

Use when config varies per deployment or feature flag:

```typescript
@Module({})
export class QueueModule {
  static register(options: IQueueOptions): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        { provide: QUEUE_OPTIONS, useValue: options },
        QueueService,
      ],
      exports: [QueueService],
    };
  }
}
```

## Custom providers

| Pattern | Use when |
|---------|----------|
| `useClass` | Default implementation swap (e.g., storage provider) |
| `useFactory` | Async config (ConfigService, secrets) |
| `useValue` | Constants, test mocks |
| `@Inject(TOKEN)` | Interface / string token binding |

## Event loop — common blockers

| Operation | Risk | Mitigation |
|-----------|------|------------|
| `bcrypt.hashSync` / large sync crypto | Blocks poll phase | `bcrypt.hash` async or Worker Thread |
| Large file read (`readFileSync`) | Blocks I/O | Streams + `createReadStream` |
| Heavy JSON parse (>1MB) | Blocks CPU | Stream parser or Worker Thread |
| Image/video transcoding | CPU-bound | BullMQ job + ffmpeg worker |
| Tight loops on large arrays | CPU-bound | Chunk with `setImmediate` or Worker Thread |

## BullMQ offload pattern

```typescript
// orders.processor.ts
@Processor('orders')
export class OrdersProcessor extends WorkerHost {
  async process(job: Job<IProcessOrderPayload>) {
    await this.ordersService.processOrder(job.data.orderId);
  }
}

// orders.service.ts — enqueue instead of blocking
await this.ordersQueue.add('process', { orderId }, { attempts: 3, backoff: 5000 });
```

## Circular dependency resolution (prefer in order)

1. **Extract shared module** — move shared provider to `shared/` or `common/`.
2. **Event-driven decoupling** — `@nestjs/event-emitter` or domain events.
3. **`forwardRef()`** — last resort; document why.

## Anti-patterns

| Anti-pattern | Fix |
|--------------|-----|
| Fat controller with Prisma calls | Move to service + repository |
| God service (>500 lines) | Split by use case or subdomain |
| `any` in DTOs or service returns | Define interfaces with `I` prefix |
| Global mutable state | Inject scoped/singleton providers |
| Business logic in Guard/Interceptor | Guards = auth; Interceptors = cross-cutting only |
| N+1 queries in loops | Batch queries, `include`/`select` in repository |
| Monolithic module for 10+ domains | One NestJS module per bounded context |

## Microservice boundaries (when to split)

Split when a feature has:

- Independent scaling needs (e.g., media processing vs CRUD API)
- Different deployment cadence or team ownership
- Heavy resource isolation (CPU workers, GPU)

Keep in monolith (modular) when:

- Tight transactional consistency is required
- Team size is small and domains are coupled
- Latency of inter-service calls is unacceptable

Use NestJS `@nestjs/microservices` or separate deployable apps sharing Prisma schema packages.

## Library defaults

| Concern | Preferred |
|---------|-----------|
| ORM | Prisma |
| Validation | class-validator + class-transformer |
| Auth | Passport + JWT |
| Queues | BullMQ + Redis |
| Config | @nestjs/config |
| Testing | Jest + @nestjs/testing + Supertest |
| Scheduling | @nestjs/schedule or BullMQ repeatable jobs |
| Caching | Redis via cache-manager or direct ioredis |

## Interface naming (Jaryan)

```typescript
export interface IEvent { id: string; title: string; }
export interface IEventsRepository {
  findById(id: string): Promise<IEvent | null>;
}
```

Use `interface` with `I` prefix; `type` for unions/aliases only. `import type` for type-only imports.
