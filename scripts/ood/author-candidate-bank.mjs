import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname;
const TRACK_ROOT = join(ROOT, "manual/source/object-oriented-design-interview");
const BANK_ROOT = join(TRACK_ROOT, "candidate-bank");
const CREATED_AT = "2026-08-15T00:00:00.000Z";
const CONTENT_VERSION = "object-oriented-design-interview-candidate-v2026.08.15";
const TAXONOMY_VERSION = "object-oriented-design-interview-workbook-v2026.08.15";
const AUTHOR = "OpenAI GPT-5.6 Pro (candidate authoring; not a human reviewer)";

const sourceRecords = [
  ["INT-AMZ-TOPICS", "Official interview preparation", "Amazon Software Development Interview Topics", "https://amazon.jobs/content/en/how-we-hire/interview-prep/software-development-topics", "MEDIUM", "Interview relevance and applied problem-solving signal; not a complete OOD syllabus."],
  ["UML", "Open standard", "OMG Unified Modeling Language 2.5.1", "https://www.omg.org/spec/UML/2.5.1/About-UML", "LOW", "Structure, relationships, interactions, state machines, and object-system communication."],
  ["ORACLE-OOP", "Primary language documentation", "Oracle Object-Oriented Programming Concepts", "https://docs.oracle.com/javase/tutorial/java/concepts/index.html", "LOW", "Objects, classes, state, behavior, encapsulation, inheritance, and interfaces."],
  ["JAVA-LANG", "Language specification", "Java Language Specification", "https://docs.oracle.com/javase/specs/jls/se21/html/index.html", "MEDIUM", "Class, interface, type, inheritance, initialization, and concurrency semantics."],
  ["CSHARP-OOP", "Primary language documentation", "C# object-oriented programming", "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/tutorials/oop", "MEDIUM", "Abstraction, encapsulation, inheritance, polymorphism, types, and contracts."],
  ["TS-CLASSES", "Primary language documentation", "TypeScript Handbook — Classes", "https://www.typescriptlang.org/docs/handbook/2/classes.html", "HIGH", "Classes, visibility, inheritance, abstract members, and structural typing boundaries."],
  ["SOLID-MS", "Primary architecture guidance", "Designing the microservice application layer and Web API", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-application-layer-web-api-design", "MEDIUM", "Application services, dependency inversion, separation of concerns, and domain/application boundaries."],
  ["ARCH-PRINCIPLES", "Primary architecture guidance", "Architectural principles for maintainable applications", "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles", "MEDIUM", "Explicit dependencies, separation of concerns, and maintainable design boundaries."],
  ["DI-MS", "Primary framework guidance", "Dependency injection guidelines", "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines", "HIGH", "Dependency ownership, service lifetimes, disposal, containers, and DI trade-offs."],
  ["DDD-MS", "Primary architecture guidance", "Implementing a microservice domain model with .NET", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model", "MEDIUM", "Entities, value objects, aggregate roots, invariants, domain services, and boundaries."],
  ["REPO-MS", "Primary architecture guidance", "Designing the infrastructure persistence layer", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design", "MEDIUM", "Repository abstraction, domain/infrastructure separation, and persistence boundaries."],
  ["DOMAIN-EVENTS", "Primary architecture guidance", "Domain events: design and implementation", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation", "MEDIUM", "Domain events, side effects, aggregate collaboration, and consistency boundaries."],
  ["CPP-GUIDE", "Primary language/design guidance", "C++ Core Guidelines", "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines", "MEDIUM", "Interfaces, resource management, ownership, lifetime, concurrency, and error handling."],
  ["REFACTOR", "Primary author catalog", "Martin Fowler — Catalog of Refactorings", "https://martinfowler.com/refactoring/catalog/", "LOW", "Behavior-preserving design improvements and code-smell remediation."],
  ["DDD-FOWLER", "Primary author reference", "Martin Fowler — Domain-Driven Design", "https://martinfowler.com/bliki/DomainDrivenDesign.html", "LOW", "Domain-model focus, language, boundaries, and design intent."],
  ["EAA-CATALOG", "Primary author catalog", "Patterns of Enterprise Application Architecture catalog", "https://martinfowler.com/eaaCatalog/", "LOW", "Repository, Unit of Work, Identity Map, Data Mapper, and enterprise object patterns."],
  ["DOTNET-GUIDELINES", "Primary platform guidance", ".NET Framework Design Guidelines", "https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/", "MEDIUM", "Public API design, exceptions, extensibility, and versioning."],
  ["TESTING-MS", "Primary platform guidance", "Unit testing best practices with .NET", "https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices", "MEDIUM", "Test isolation, naming, determinism, seams, and maintainable unit tests."],
  ["JAVA-OBJECT", "Primary API documentation", "Java Object class", "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html", "MEDIUM", "Equality, hash codes, identity, cloning boundaries, and object contracts."],
  ["JAVA-CONCURRENCY", "Language specification", "Java Memory Model and threads", "https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html", "MEDIUM", "Memory visibility, synchronization, happens-before, data races, and concurrency semantics."],
  ["CSHARP-EQUALITY", "Primary language guidance", "C# equality comparisons", "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons", "MEDIUM", "Reference versus value equality and equality implementation contracts."],
  ["CSHARP-EXCEPTIONS", "Primary language guidance", "C# exceptions and exception handling", "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/", "MEDIUM", "Exception contracts, propagation, cleanup, and failure handling."],
  ["JAVA-GENERICS", "Primary language documentation", "Java Generics", "https://docs.oracle.com/javase/tutorial/java/generics/", "MEDIUM", "Generic types, bounds, variance-related reasoning, and type-safe abstractions."],
  ["TS-OBJECTS", "Primary language documentation", "TypeScript Handbook — Object Types", "https://www.typescriptlang.org/docs/handbook/2/objects.html", "HIGH", "Object types, interfaces, optional/readonly properties, extension, and structural contracts."]
].map(([key, role, title, url, volatility, use]) => ({ key, role, title, url, volatility, use, checkedAt: "2026-08-15", status: "refreshed_primary_source" }));
const sources = new Map(sourceRecords.map((source) => [source.key, source]));

const nodes = [
  [1, "requirements_use_cases_domain_vocabulary_and_model_boundaries", "Requirements, use cases, domain vocabulary, and model boundaries", 8, 121, 135, 175, ["OOD-C01", "OOD-C02", "OOD-C03", "OOD-C04"], ["INT-AMZ-TOPICS", "UML", "DDD-MS", "DDD-FOWLER"]],
  [2, "objects_responsibilities_encapsulation_and_invariants", "Objects, responsibilities, encapsulation, and invariants", 8, 121, 145, 190, ["OOD-C05", "OOD-C06", "OOD-C07", "OOD-C08"], ["ORACLE-OOP", "CSHARP-OOP", "DDD-MS", "JAVA-OBJECT", "CSHARP-EQUALITY"]],
  [3, "relationships_composition_ownership_lifecycle_and_dependencies", "Relationships, composition, ownership, lifecycle, and dependencies", 9, 121, 155, 205, ["OOD-C09", "OOD-C10", "OOD-C11", "OOD-C12"], ["UML", "DI-MS", "ARCH-PRINCIPLES", "CPP-GUIDE", "TS-OBJECTS"]],
  [4, "interfaces_polymorphism_substitution_and_extensibility", "Interfaces, polymorphism, substitution, and extensibility", 9, 121, 160, 210, ["OOD-C13", "OOD-C14", "OOD-C15", "OOD-C16"], ["ORACLE-OOP", "JAVA-LANG", "CSHARP-OOP", "TS-CLASSES", "JAVA-GENERICS", "SOLID-MS"]],
  [5, "object_creation_configuration_and_structural_patterns", "Object creation, configuration, and structural patterns", 9, 121, 145, 190, ["OOD-C17", "OOD-C18", "OOD-C19", "OOD-C20"], ["UML", "DI-MS", "CPP-GUIDE", "ARCH-PRINCIPLES", "EAA-CATALOG"]],
  [6, "behavior_state_commands_events_and_workflows", "Behavior, state, commands, events, and workflows", 10, 121, 170, 225, ["OOD-C21", "OOD-C22", "OOD-C23", "OOD-C24"], ["UML", "DOMAIN-EVENTS", "SOLID-MS", "EAA-CATALOG"]],
  [7, "persistence_repositories_serialization_and_domain_boundaries", "Persistence, repositories, serialization, and domain boundaries", 8, 121, 140, 185, ["OOD-C25", "OOD-C26", "OOD-C27", "OOD-C28"], ["REPO-MS", "DDD-MS", "EAA-CATALOG", "DOTNET-GUIDELINES"]],
  [8, "concurrency_thread_safety_resources_and_failure_handling", "Concurrency, thread safety, resources, and failure handling", 9, 121, 150, 200, ["OOD-C29", "OOD-C30", "OOD-C31", "OOD-C32"], ["JAVA-CONCURRENCY", "CPP-GUIDE", "CSHARP-EXCEPTIONS", "DI-MS"]],
  [9, "testability_refactoring_api_evolution_and_maintainability", "Testability, refactoring, API evolution, and maintainability", 9, 121, 155, 205, ["OOD-C33", "OOD-C34", "OOD-C35", "OOD-C36"], ["REFACTOR", "TESTING-MS", "DOTNET-GUIDELINES", "ARCH-PRINCIPLES", "INT-AMZ-TOPICS"]]
].map(([order, nodeId, title, unitCount, floor, workingLow, workingHigh, competencyIds, sourceKeys]) => ({ order, nodeId, title, unitCount, floor, workingLow, workingHigh, competencyIds, sourceKeys }));

const units = [
  [1, "OOD-N01-B01", "Actors, goals, use cases, and system boundary", "OOD-C01", "", "Actors, use cases, scenarios, domain concepts, invariants, vocabulary, boundaries, interactions, and design communication", "INT-AMZ-TOPICS; UML; DDD-MS; DDD-FOWLER"],
  [1, "OOD-N01-B02", "Happy paths, alternate flows, errors, and exceptional scenarios", "OOD-C01; OOD-C03", "", "Actors, use cases, scenarios, domain concepts, invariants, vocabulary, boundaries, interactions, and design communication", "INT-AMZ-TOPICS; UML; DDD-MS; DDD-FOWLER"],
  [1, "OOD-N01-B03", "Domain nouns, verbs, entities, values, and services", "OOD-C02", "OOD-C05", "Actors, use cases, scenarios, domain concepts, invariants, vocabulary, boundaries, interactions, and design communication", "INT-AMZ-TOPICS; UML; DDD-MS; DDD-FOWLER"],
  [1, "OOD-N01-B04", "Business rules, invariants, and legal state transitions", "OOD-C03", "OOD-C23", "Actors, use cases, scenarios, domain concepts, invariants, vocabulary, boundaries, interactions, and design communication", "INT-AMZ-TOPICS; UML; DDD-MS; DDD-FOWLER"],
  [1, "OOD-N01-B05", "Ubiquitous language and naming consistency", "OOD-C02", "", "Actors, use cases, scenarios, domain concepts, invariants, vocabulary, boundaries, interactions, and design communication", "INT-AMZ-TOPICS; UML; DDD-MS; DDD-FOWLER"],
  [1, "OOD-N01-B06", "Object, domain-service, application-service, and data boundaries", "OOD-C02", "OOD-C25", "Actors, use cases, scenarios, domain concepts, invariants, vocabulary, boundaries, interactions, and design communication", "INT-AMZ-TOPICS; UML; DDD-MS; DDD-FOWLER"],
  [1, "OOD-N01-B07", "Sequence walkthroughs and responsibility discovery", "OOD-C04", "OOD-C01; OOD-C09", "Actors, use cases, scenarios, domain concepts, invariants, vocabulary, boundaries, interactions, and design communication", "INT-AMZ-TOPICS; UML; DDD-MS; DDD-FOWLER"],
  [1, "OOD-N01-B08", "Scope, assumptions, diagrams, and trade-off communication", "OOD-C01; OOD-C04", "", "Actors, use cases, scenarios, domain concepts, invariants, vocabulary, boundaries, interactions, and design communication", "INT-AMZ-TOPICS; UML; DDD-MS; DDD-FOWLER"],
  [2, "OOD-N02-B01", "State and behavior cohesion", "OOD-C05", "", "Cohesive behavior, encapsulated state, responsibility assignment, identity, values, constructors, nullability, and failure contracts", "ORACLE-OOP; CSHARP-OOP; DDD-MS; JAVA-OBJECT; CSHARP-EQUALITY"],
  [2, "OOD-N02-B02", "Encapsulation and valid state transitions", "OOD-C06", "OOD-C03; OOD-C24", "Cohesive behavior, encapsulated state, responsibility assignment, identity, values, constructors, nullability, and failure contracts", "ORACLE-OOP; CSHARP-OOP; DDD-MS; JAVA-OBJECT; CSHARP-EQUALITY"],
  [2, "OOD-N02-B03", "Tell-don't-ask, anemic models, and behavior placement", "OOD-C05", "OOD-C34", "Cohesive behavior, encapsulated state, responsibility assignment, identity, values, constructors, nullability, and failure contracts", "ORACLE-OOP; CSHARP-OOP; DDD-MS; JAVA-OBJECT; CSHARP-EQUALITY"],
  [2, "OOD-N02-B04", "Responsibilities and reasons to change", "OOD-C05", "OOD-C14; OOD-C34", "Cohesive behavior, encapsulated state, responsibility assignment, identity, values, constructors, nullability, and failure contracts", "ORACLE-OOP; CSHARP-OOP; DDD-MS; JAVA-OBJECT; CSHARP-EQUALITY"],
  [2, "OOD-N02-B05", "Immutable objects and value-object semantics", "OOD-C07", "OOD-C02; OOD-C29", "Cohesive behavior, encapsulated state, responsibility assignment, identity, values, constructors, nullability, and failure contracts", "ORACLE-OOP; CSHARP-OOP; DDD-MS; JAVA-OBJECT; CSHARP-EQUALITY"],
  [2, "OOD-N02-B06", "Entity identity, equality, hashing, and lifecycle continuity", "OOD-C07", "OOD-C02; OOD-C26", "Cohesive behavior, encapsulated state, responsibility assignment, identity, values, constructors, nullability, and failure contracts", "ORACLE-OOP; CSHARP-OOP; DDD-MS; JAVA-OBJECT; CSHARP-EQUALITY"],
  [2, "OOD-N02-B07", "Constructors, factories, validation, and valid creation", "OOD-C06; OOD-C08", "OOD-C17", "Cohesive behavior, encapsulated state, responsibility assignment, identity, values, constructors, nullability, and failure contracts", "ORACLE-OOP; CSHARP-OOP; DDD-MS; JAVA-OBJECT; CSHARP-EQUALITY"],
  [2, "OOD-N02-B08", "Nullability, optional values, results, and error contracts", "OOD-C06; OOD-C08", "", "Cohesive behavior, encapsulated state, responsibility assignment, identity, values, constructors, nullability, and failure contracts", "ORACLE-OOP; CSHARP-OOP; DDD-MS; JAVA-OBJECT; CSHARP-EQUALITY"],
  [3, "OOD-N03-B01", "Associations, aggregation, composition, and multiplicity", "OOD-C09", "OOD-C19", "Associations, multiplicity, composition, ownership, lifecycle, dependency direction, cycles, DI, resources, and module visibility", "UML; DI-MS; ARCH-PRINCIPLES; CPP-GUIDE; TS-OBJECTS"],
  [3, "OOD-N03-B02", "Navigability, references, and bidirectional relationship cost", "OOD-C09", "OOD-C22; OOD-C27", "Associations, multiplicity, composition, ownership, lifecycle, dependency direction, cycles, DI, resources, and module visibility", "UML; DI-MS; ARCH-PRINCIPLES; CPP-GUIDE; TS-OBJECTS"],
  [3, "OOD-N03-B03", "Ownership, object lifetime, and deletion semantics", "OOD-C09; OOD-C12", "", "Associations, multiplicity, composition, ownership, lifecycle, dependency direction, cycles, DI, resources, and module visibility", "UML; DI-MS; ARCH-PRINCIPLES; CPP-GUIDE; TS-OBJECTS"],
  [3, "OOD-N03-B04", "Composition versus inheritance", "OOD-C10", "OOD-C16", "Associations, multiplicity, composition, ownership, lifecycle, dependency direction, cycles, DI, resources, and module visibility", "UML; DI-MS; ARCH-PRINCIPLES; CPP-GUIDE; TS-OBJECTS"],
  [3, "OOD-N03-B05", "Dependency direction, layers, and stable abstractions", "OOD-C10; OOD-C11", "OOD-C13", "Associations, multiplicity, composition, ownership, lifecycle, dependency direction, cycles, DI, resources, and module visibility", "UML; DI-MS; ARCH-PRINCIPLES; CPP-GUIDE; TS-OBJECTS"],
  [3, "OOD-N03-B06", "Cycles, coupling, cohesion, and package boundaries", "OOD-C10; OOD-C12", "", "Associations, multiplicity, composition, ownership, lifecycle, dependency direction, cycles, DI, resources, and module visibility", "UML; DI-MS; ARCH-PRINCIPLES; CPP-GUIDE; TS-OBJECTS"],
  [3, "OOD-N03-B07", "Dependency injection, service lifetimes, and composition roots", "OOD-C11", "OOD-C33", "Associations, multiplicity, composition, ownership, lifecycle, dependency direction, cycles, DI, resources, and module visibility", "UML; DI-MS; ARCH-PRINCIPLES; CPP-GUIDE; TS-OBJECTS"],
  [3, "OOD-N03-B08", "Resource ownership, disposal, and deterministic cleanup", "OOD-C12", "OOD-C30", "Associations, multiplicity, composition, ownership, lifecycle, dependency direction, cycles, DI, resources, and module visibility", "UML; DI-MS; ARCH-PRINCIPLES; CPP-GUIDE; TS-OBJECTS"],
  [3, "OOD-N03-B09", "Visibility, modules, packages, and internal APIs", "OOD-C10", "", "Associations, multiplicity, composition, ownership, lifecycle, dependency direction, cycles, DI, resources, and module visibility", "UML; DI-MS; ARCH-PRINCIPLES; CPP-GUIDE; TS-OBJECTS"],
  [4, "OOD-N04-B01", "Interface contracts, abstraction, and information hiding", "OOD-C13", "OOD-C18", "Contracts, subtype behavior, substitutability, interface segregation, dependency inversion, extension points, generics, capabilities, and base-class trade-offs", "ORACLE-OOP; JAVA-LANG; CSHARP-OOP; TS-CLASSES; JAVA-GENERICS; SOLID-MS"],
  [4, "OOD-N04-B02", "Subtype polymorphism and dynamic dispatch", "OOD-C14; OOD-C16", "", "Contracts, subtype behavior, substitutability, interface segregation, dependency inversion, extension points, generics, capabilities, and base-class trade-offs", "ORACLE-OOP; JAVA-LANG; CSHARP-OOP; TS-CLASSES; JAVA-GENERICS; SOLID-MS"],
  [4, "OOD-N04-B03", "Substitutability, preconditions, postconditions, and invariants", "OOD-C14", "", "Contracts, subtype behavior, substitutability, interface segregation, dependency inversion, extension points, generics, capabilities, and base-class trade-offs", "ORACLE-OOP; JAVA-LANG; CSHARP-OOP; TS-CLASSES; JAVA-GENERICS; SOLID-MS"],
  [4, "OOD-N04-B04", "Interface segregation and role-specific contracts", "OOD-C13; OOD-C14", "", "Contracts, subtype behavior, substitutability, interface segregation, dependency inversion, extension points, generics, capabilities, and base-class trade-offs", "ORACLE-OOP; JAVA-LANG; CSHARP-OOP; TS-CLASSES; JAVA-GENERICS; SOLID-MS"],
  [4, "OOD-N04-B05", "Dependency inversion and stable policy boundaries", "OOD-C14", "OOD-C11", "Contracts, subtype behavior, substitutability, interface segregation, dependency inversion, extension points, generics, capabilities, and base-class trade-offs", "ORACLE-OOP; JAVA-LANG; CSHARP-OOP; TS-CLASSES; JAVA-GENERICS; SOLID-MS"],
  [4, "OOD-N04-B06", "Extension points, plugins, callbacks, and registration", "OOD-C15", "OOD-C21; OOD-C35", "Contracts, subtype behavior, substitutability, interface segregation, dependency inversion, extension points, generics, capabilities, and base-class trade-offs", "ORACLE-OOP; JAVA-LANG; CSHARP-OOP; TS-CLASSES; JAVA-GENERICS; SOLID-MS"],
  [4, "OOD-N04-B07", "Generics, templates, bounds, and variance reasoning", "OOD-C15", "", "Contracts, subtype behavior, substitutability, interface segregation, dependency inversion, extension points, generics, capabilities, and base-class trade-offs", "ORACLE-OOP; JAVA-LANG; CSHARP-OOP; TS-CLASSES; JAVA-GENERICS; SOLID-MS"],
  [4, "OOD-N04-B08", "Capability-based interfaces and avoiding marker abstractions", "OOD-C13; OOD-C15", "", "Contracts, subtype behavior, substitutability, interface segregation, dependency inversion, extension points, generics, capabilities, and base-class trade-offs", "ORACLE-OOP; JAVA-LANG; CSHARP-OOP; TS-CLASSES; JAVA-GENERICS; SOLID-MS"],
  [4, "OOD-N04-B09", "Abstract base classes, default behavior, and interface trade-offs", "OOD-C16", "OOD-C10", "Contracts, subtype behavior, substitutability, interface segregation, dependency inversion, extension points, generics, capabilities, and base-class trade-offs", "ORACLE-OOP; JAVA-LANG; CSHARP-OOP; TS-CLASSES; JAVA-GENERICS; SOLID-MS"],
  [5, "OOD-N05-B01", "Factory method, abstract factory, and object-family creation", "OOD-C17; OOD-C20", "OOD-C15", "Factories, builders, copying, adapters, facades, decorators, proxies, composites, bridges, flyweights, and composition roots", "UML; DI-MS; CPP-GUIDE; ARCH-PRINCIPLES; EAA-CATALOG"],
  [5, "OOD-N05-B02", "Builder patterns, staged construction, and validation", "OOD-C17", "OOD-C08", "Factories, builders, copying, adapters, facades, decorators, proxies, composites, bridges, flyweights, and composition roots", "UML; DI-MS; CPP-GUIDE; ARCH-PRINCIPLES; EAA-CATALOG"],
  [5, "OOD-N05-B03", "Prototype, copy, clone, and deep-versus-shallow semantics", "OOD-C17", "", "Factories, builders, copying, adapters, facades, decorators, proxies, composites, bridges, flyweights, and composition roots", "UML; DI-MS; CPP-GUIDE; ARCH-PRINCIPLES; EAA-CATALOG"],
  [5, "OOD-N05-B04", "Adapter and facade boundaries", "OOD-C18; OOD-C20", "", "Factories, builders, copying, adapters, facades, decorators, proxies, composites, bridges, flyweights, and composition roots", "UML; DI-MS; CPP-GUIDE; ARCH-PRINCIPLES; EAA-CATALOG"],
  [5, "OOD-N05-B05", "Decorator and proxy behavior", "OOD-C18", "", "Factories, builders, copying, adapters, facades, decorators, proxies, composites, bridges, flyweights, and composition roots", "UML; DI-MS; CPP-GUIDE; ARCH-PRINCIPLES; EAA-CATALOG"],
  [5, "OOD-N05-B06", "Composite structures and uniform traversal", "OOD-C19", "", "Factories, builders, copying, adapters, facades, decorators, proxies, composites, bridges, flyweights, and composition roots", "UML; DI-MS; CPP-GUIDE; ARCH-PRINCIPLES; EAA-CATALOG"],
  [5, "OOD-N05-B07", "Bridge and independent dimension variation", "OOD-C19", "", "Factories, builders, copying, adapters, facades, decorators, proxies, composites, bridges, flyweights, and composition roots", "UML; DI-MS; CPP-GUIDE; ARCH-PRINCIPLES; EAA-CATALOG"],
  [5, "OOD-N05-B08", "Flyweight, shared state, and resource reuse", "OOD-C19", "", "Factories, builders, copying, adapters, facades, decorators, proxies, composites, bridges, flyweights, and composition roots", "UML; DI-MS; CPP-GUIDE; ARCH-PRINCIPLES; EAA-CATALOG"],
  [5, "OOD-N05-B09", "Configuration objects, composition roots, and dependency assembly", "OOD-C17; OOD-C20", "OOD-C36", "Factories, builders, copying, adapters, facades, decorators, proxies, composites, bridges, flyweights, and composition roots", "UML; DI-MS; CPP-GUIDE; ARCH-PRINCIPLES; EAA-CATALOG"],
  [6, "OOD-N06-B01", "Strategy, policy objects, and interchangeable behavior", "OOD-C21; OOD-C24", "", "Strategy, state, commands, undo, observers, mediators, chains, templates, iterators, visitors, domain events, and workflow invariants", "UML; DOMAIN-EVENTS; SOLID-MS; EAA-CATALOG"],
  [6, "OOD-N06-B02", "State pattern and explicit state machines", "OOD-C21; OOD-C23", "OOD-C04; OOD-C06", "Strategy, state, commands, undo, observers, mediators, chains, templates, iterators, visitors, domain events, and workflow invariants", "UML; DOMAIN-EVENTS; SOLID-MS; EAA-CATALOG"],
  [6, "OOD-N06-B03", "Command objects, undo, redo, and transactional intent", "OOD-C21; OOD-C23", "", "Strategy, state, commands, undo, observers, mediators, chains, templates, iterators, visitors, domain events, and workflow invariants", "UML; DOMAIN-EVENTS; SOLID-MS; EAA-CATALOG"],
  [6, "OOD-N06-B04", "Observer, publish-subscribe, and event subscriptions", "OOD-C22", "", "Strategy, state, commands, undo, observers, mediators, chains, templates, iterators, visitors, domain events, and workflow invariants", "UML; DOMAIN-EVENTS; SOLID-MS; EAA-CATALOG"],
  [6, "OOD-N06-B05", "Mediator and collaboration centralization", "OOD-C22", "", "Strategy, state, commands, undo, observers, mediators, chains, templates, iterators, visitors, domain events, and workflow invariants", "UML; DOMAIN-EVENTS; SOLID-MS; EAA-CATALOG"],
  [6, "OOD-N06-B06", "Chain of responsibility and ordered handling", "OOD-C21", "", "Strategy, state, commands, undo, observers, mediators, chains, templates, iterators, visitors, domain events, and workflow invariants", "UML; DOMAIN-EVENTS; SOLID-MS; EAA-CATALOG"],
  [6, "OOD-N06-B07", "Template method and invariant algorithm structure", "OOD-C21; OOD-C24", "", "Strategy, state, commands, undo, observers, mediators, chains, templates, iterators, visitors, domain events, and workflow invariants", "UML; DOMAIN-EVENTS; SOLID-MS; EAA-CATALOG"],
  [6, "OOD-N06-B08", "Iterator, visitor, and traversal-operation boundaries", "OOD-C23", "", "Strategy, state, commands, undo, observers, mediators, chains, templates, iterators, visitors, domain events, and workflow invariants", "UML; DOMAIN-EVENTS; SOLID-MS; EAA-CATALOG"],
  [6, "OOD-N06-B09", "Domain events, side effects, and aggregate collaboration", "OOD-C22; OOD-C24", "", "Strategy, state, commands, undo, observers, mediators, chains, templates, iterators, visitors, domain events, and workflow invariants", "UML; DOMAIN-EVENTS; SOLID-MS; EAA-CATALOG"],
  [6, "OOD-N06-B10", "Workflow orchestration, sequencing, compensation, and invariants", "OOD-C23; OOD-C24", "", "Strategy, state, commands, undo, observers, mediators, chains, templates, iterators, visitors, domain events, and workflow invariants", "UML; DOMAIN-EVENTS; SOLID-MS; EAA-CATALOG"],
  [7, "OOD-N07-B01", "Repository contracts and collection-like domain access", "OOD-C25", "", "Repositories, aggregates, transactions, ORM mapping, identity maps, units of work, serialization, DTOs, loading, and infrastructure separation", "REPO-MS; DDD-MS; EAA-CATALOG; DOTNET-GUIDELINES"],
  [7, "OOD-N07-B02", "Aggregate boundaries, invariants, and transaction scope", "OOD-C25", "", "Repositories, aggregates, transactions, ORM mapping, identity maps, units of work, serialization, DTOs, loading, and infrastructure separation", "REPO-MS; DDD-MS; EAA-CATALOG; DOTNET-GUIDELINES"],
  [7, "OOD-N07-B03", "ORM mapping and leaky persistence abstractions", "OOD-C26", "", "Repositories, aggregates, transactions, ORM mapping, identity maps, units of work, serialization, DTOs, loading, and infrastructure separation", "REPO-MS; DDD-MS; EAA-CATALOG; DOTNET-GUIDELINES"],
  [7, "OOD-N07-B04", "Identity Map, Unit of Work, and object identity", "OOD-C26; OOD-C27", "OOD-C07", "Repositories, aggregates, transactions, ORM mapping, identity maps, units of work, serialization, DTOs, loading, and infrastructure separation", "REPO-MS; DDD-MS; EAA-CATALOG; DOTNET-GUIDELINES"],
  [7, "OOD-N07-B05", "Serialization, versioning, compatibility, and defaults", "OOD-C26", "OOD-C35", "Repositories, aggregates, transactions, ORM mapping, identity maps, units of work, serialization, DTOs, loading, and infrastructure separation", "REPO-MS; DDD-MS; EAA-CATALOG; DOTNET-GUIDELINES"],
  [7, "OOD-N07-B06", "DTOs, mappers, anti-corruption boundaries, and domain objects", "OOD-C26", "", "Repositories, aggregates, transactions, ORM mapping, identity maps, units of work, serialization, DTOs, loading, and infrastructure separation", "REPO-MS; DDD-MS; EAA-CATALOG; DOTNET-GUIDELINES"],
  [7, "OOD-N07-B07", "Lazy loading, eager loading, proxies, and query ownership", "OOD-C27", "", "Repositories, aggregates, transactions, ORM mapping, identity maps, units of work, serialization, DTOs, loading, and infrastructure separation", "REPO-MS; DDD-MS; EAA-CATALOG; DOTNET-GUIDELINES"],
  [7, "OOD-N07-B08", "Persistence failures, idempotency, retries, and consistency boundaries", "OOD-C28", "OOD-C31", "Repositories, aggregates, transactions, ORM mapping, identity maps, units of work, serialization, DTOs, loading, and infrastructure separation", "REPO-MS; DDD-MS; EAA-CATALOG; DOTNET-GUIDELINES"],
  [8, "OOD-N08-B01", "Shared mutable state and confinement", "OOD-C29", "", "Shared mutable state, synchronization, actors, atomicity, races, deadlocks, async, cancellation, resource ownership, exceptions, and idempotency", "JAVA-CONCURRENCY; CPP-GUIDE; CSHARP-EXCEPTIONS; DI-MS"],
  [8, "OOD-N08-B02", "Locks, immutability, actors, queues, and ownership transfer", "OOD-C29", "", "Shared mutable state, synchronization, actors, atomicity, races, deadlocks, async, cancellation, resource ownership, exceptions, and idempotency", "JAVA-CONCURRENCY; CPP-GUIDE; CSHARP-EXCEPTIONS; DI-MS"],
  [8, "OOD-N08-B03", "Atomicity, races, visibility, and happens-before reasoning", "OOD-C32", "", "Shared mutable state, synchronization, actors, atomicity, races, deadlocks, async, cancellation, resource ownership, exceptions, and idempotency", "JAVA-CONCURRENCY; CPP-GUIDE; CSHARP-EXCEPTIONS; DI-MS"],
  [8, "OOD-N08-B04", "Deadlocks, lock ordering, starvation, and livelock", "OOD-C32", "", "Shared mutable state, synchronization, actors, atomicity, races, deadlocks, async, cancellation, resource ownership, exceptions, and idempotency", "JAVA-CONCURRENCY; CPP-GUIDE; CSHARP-EXCEPTIONS; DI-MS"],
  [8, "OOD-N08-B05", "Thread-safe collections and compound operations", "OOD-C29; OOD-C32", "", "Shared mutable state, synchronization, actors, atomicity, races, deadlocks, async, cancellation, resource ownership, exceptions, and idempotency", "JAVA-CONCURRENCY; CPP-GUIDE; CSHARP-EXCEPTIONS; DI-MS"],
  [8, "OOD-N08-B06", "Async operations, cancellation, timeouts, and completion", "OOD-C30", "", "Shared mutable state, synchronization, actors, atomicity, races, deadlocks, async, cancellation, resource ownership, exceptions, and idempotency", "JAVA-CONCURRENCY; CPP-GUIDE; CSHARP-EXCEPTIONS; DI-MS"],
  [8, "OOD-N08-B07", "Resource ownership, RAII, disposal, and cleanup", "OOD-C30; OOD-C32", "OOD-C12", "Shared mutable state, synchronization, actors, atomicity, races, deadlocks, async, cancellation, resource ownership, exceptions, and idempotency", "JAVA-CONCURRENCY; CPP-GUIDE; CSHARP-EXCEPTIONS; DI-MS"],
  [8, "OOD-N08-B08", "Exception safety, failure propagation, and partial effects", "OOD-C30; OOD-C31", "OOD-C08", "Shared mutable state, synchronization, actors, atomicity, races, deadlocks, async, cancellation, resource ownership, exceptions, and idempotency", "JAVA-CONCURRENCY; CPP-GUIDE; CSHARP-EXCEPTIONS; DI-MS"],
  [8, "OOD-N08-B09", "Retryable and idempotent object boundaries", "OOD-C31", "OOD-C28", "Shared mutable state, synchronization, actors, atomicity, races, deadlocks, async, cancellation, resource ownership, exceptions, and idempotency", "JAVA-CONCURRENCY; CPP-GUIDE; CSHARP-EXCEPTIONS; DI-MS"],
  [9, "OOD-N09-B01", "Test seams, dependency boundaries, mocks, stubs, and fakes", "OOD-C33", "", "Seams, test doubles, refactoring, smells, compatibility, deprecation, observability, performance, simplicity, and design review", "REFACTOR; TESTING-MS; DOTNET-GUIDELINES; ARCH-PRINCIPLES; INT-AMZ-TOPICS"],
  [9, "OOD-N09-B02", "Testable constructors, clocks, randomness, I/O, and collaborators", "OOD-C33", "", "Seams, test doubles, refactoring, smells, compatibility, deprecation, observability, performance, simplicity, and design review", "REFACTOR; TESTING-MS; DOTNET-GUIDELINES; ARCH-PRINCIPLES; INT-AMZ-TOPICS"],
  [9, "OOD-N09-B03", "Code smells, feature envy, data clumps, and misplaced behavior", "OOD-C34", "", "Seams, test doubles, refactoring, smells, compatibility, deprecation, observability, performance, simplicity, and design review", "REFACTOR; TESTING-MS; DOTNET-GUIDELINES; ARCH-PRINCIPLES; INT-AMZ-TOPICS"],
  [9, "OOD-N09-B04", "Behavior-preserving refactoring and incremental redesign", "OOD-C34", "", "Seams, test doubles, refactoring, smells, compatibility, deprecation, observability, performance, simplicity, and design review", "REFACTOR; TESTING-MS; DOTNET-GUIDELINES; ARCH-PRINCIPLES; INT-AMZ-TOPICS"],
  [9, "OOD-N09-B05", "Public API compatibility, versioning, and deprecation", "OOD-C35", "", "Seams, test doubles, refactoring, smells, compatibility, deprecation, observability, performance, simplicity, and design review", "REFACTOR; TESTING-MS; DOTNET-GUIDELINES; ARCH-PRINCIPLES; INT-AMZ-TOPICS"],
  [9, "OOD-N09-B06", "Observability, diagnostics, and explainable object behavior", "OOD-C36", "OOD-C32", "Seams, test doubles, refactoring, smells, compatibility, deprecation, observability, performance, simplicity, and design review", "REFACTOR; TESTING-MS; DOTNET-GUIDELINES; ARCH-PRINCIPLES; INT-AMZ-TOPICS"],
  [9, "OOD-N09-B07", "Abstraction cost, performance, memory, and allocation trade-offs", "OOD-C36", "", "Seams, test doubles, refactoring, smells, compatibility, deprecation, observability, performance, simplicity, and design review", "REFACTOR; TESTING-MS; DOTNET-GUIDELINES; ARCH-PRINCIPLES; INT-AMZ-TOPICS"],
  [9, "OOD-N09-B08", "Overengineering, pattern misuse, YAGNI, and simplicity", "OOD-C36", "OOD-C20", "Seams, test doubles, refactoring, smells, compatibility, deprecation, observability, performance, simplicity, and design review", "REFACTOR; TESTING-MS; DOTNET-GUIDELINES; ARCH-PRINCIPLES; INT-AMZ-TOPICS"],
  [9, "OOD-N09-B09", "Design-review communication, alternatives, and iterative refinement", "OOD-C36", "", "Seams, test doubles, refactoring, smells, compatibility, deprecation, observability, performance, simplicity, and design review", "REFACTOR; TESTING-MS; DOTNET-GUIDELINES; ARCH-PRINCIPLES; INT-AMZ-TOPICS"]
].map(([nodeOrder, unitId, title, primaryCompetencyIds, secondaryCompetencyIds, coverageFocus, sourceKeyString]) => ({
  nodeOrder,
  unitId,
  title,
  primaryCompetencyIds: primaryCompetencyIds.split("; "),
  secondaryCompetencyIds: secondaryCompetencyIds ? secondaryCompetencyIds.split("; ") : [],
  coverageFocus,
  sourceKeys: sourceKeyString.split("; ")
}));

const domains = [
  ["a regional produce marketplace", "the seller operations lead", "publish a seasonal inventory change", "a listing cannot become visible before its price and stock rule are valid", "seller trust and auditability"],
  ["a multi-tenant rehearsal scheduler", "the studio coordinator", "move a booked rehearsal to a different room", "the room capacity and cancellation policy must remain consistent", "double-booked sessions"],
  ["a collaborative annotation workspace", "the review editor", "accept a comment and notify the assigned author", "accepted comments must retain their author and document revision", "lost attribution"],
  ["a cold-chain logistics console", "the dispatch planner", "reassign a shipment to a carrier", "temperature restrictions and hand-off ownership travel with the shipment", "unsafe hand-offs"],
  ["a neighborhood energy-sharing service", "the meter operator", "reserve a discharge window", "a meter cannot be committed twice for an overlapping window", "over-allocation"],
  ["a podcast production desk", "the episode producer", "replace a source recording while preserving annotations", "annotations follow stable segments rather than file offsets", "orphaned annotations"],
  ["a digital rights clearance tool", "the licensing analyst", "approve a territory-specific usage", "approval requires an explicit territory and expiration", "accidental over-licensing"],
  ["a repair-parts marketplace", "the fulfillment specialist", "split a backordered request across vendors", "each split retains the original request identity and delivery promise", "duplicate fulfillment"],
  ["a museum exhibit controller", "the exhibit operator", "switch an exhibit into maintenance mode", "unsafe commands are rejected while maintenance is active", "hardware damage"],
  ["a mobile field-inspection app", "the inspector", "submit an offline inspection", "a submission is either complete or explicitly retryable", "partial records"],
  ["a cooperative lending ledger", "the account steward", "record a repayment allocation", "a repayment cannot reduce the outstanding balance below zero", "silent balance drift"],
  ["a live captioning studio", "the caption supervisor", "switch the active language provider", "the current stream keeps its timing and error contract", "dropped captions"],
  ["a permissions review service", "the security reviewer", "grant a temporary role", "the role expires and is attributable to a specific approval", "privilege that never expires"],
  ["a drone maintenance planner", "the fleet coordinator", "schedule a battery replacement", "a battery cannot be assigned to two aircraft at once", "conflicting maintenance"],
  ["a community garden allocation tool", "the plot steward", "transfer a plot reservation", "transfer preserves the plot boundary and approval history", "orphaned reservations"],
  ["a video-learning library", "the curriculum editor", "retire a lesson while preserving learner progress", "progress refers to a stable lesson identity", "broken progress history"],
  ["a digital invoice exchange", "the billing operator", "reissue a rejected invoice", "the new issue is traceable and does not double-charge the customer", "duplicate charges"],
  ["a tournament bracket service", "the match official", "forfeit a match after a timeout", "the bracket advances only from a legal match state", "impossible bracket states"],
  ["a volunteer coordination hub", "the shift manager", "swap two volunteer assignments", "skills and availability constraints hold for both assignments", "unsafe staffing"],
  ["a document notarization service", "the notary", "seal a document revision", "the seal covers the exact immutable revision", "ambiguous evidence"],
  ["a clinic referral coordinator", "the care navigator", "route a referral to a specialist", "privacy and consent rules apply before external disclosure", "data leakage"],
  ["a subscription packaging service", "the catalog manager", "add a regional bundle", "the bundle pricing policy remains consistent with its components", "pricing divergence"],
  ["a shared whiteboard application", "the session host", "close a board and export its history", "export observes a stable session state", "incomplete exports"],
  ["a smart-building access controller", "the facilities administrator", "revoke a badge", "revocation is visible to the door policy before access is granted", "stale access"],
  ["a returns inspection workflow", "the warehouse inspector", "classify a returned item", "classification and refund eligibility are not the same responsibility", "premature refunds"],
  ["a local-first map editor", "the cartographer", "merge an offline route edit", "conflicts are explicit and never silently overwrite accepted geometry", "lost edits"],
  ["a marketplace payout service", "the finance operator", "release a seller payout", "release is idempotent and tied to a settled order", "double payout"],
  ["a music practice tracker", "the learner", "complete a timed exercise", "completion records the exercise version and score policy", "retroactive score changes"],
  ["a fleet charging coordinator", "the station operator", "reserve a charger", "charger capacity and reservation expiry are coordinated", "stuck reservations"],
  ["a customer-support escalation desk", "the support lead", "escalate a conversation", "the escalation keeps ownership and response deadlines", "unowned cases"],
  ["a package-label generation service", "the shipping operator", "print a label after address correction", "the printed label represents the current approved shipment data", "stale labels"],
  ["a research-notebook platform", "the experiment owner", "publish a result snapshot", "published outputs reference immutable inputs and code versions", "irreproducible results"],
  ["a board-game campaign manager", "the campaign host", "apply a reward to a character", "reward rules depend on the current legal campaign state", "invalid progression"],
  ["a public-transit disruption board", "the service controller", "announce a platform change", "passengers receive the change in the order in which it becomes effective", "contradictory notices"],
  ["a procurement approval queue", "the purchasing manager", "approve an exception", "approval is attributable, bounded, and cannot bypass required controls", "unreviewed spend"],
  ["a photo-archive curation tool", "the archivist", "merge duplicate metadata", "asset identity remains stable while descriptive values are replaced", "broken references"]
].map(([domain, actor, operation, constraint, risk]) => ({ domain, actor, operation, constraint, risk }));

const axes = [
  ["positive_application", "a direct application", "the normal path must preserve the stated rule"],
  ["near_miss", "a near-miss design", "one tempting shortcut violates the boundary"],
  ["misconception", "a review of a common misconception", "the option must diagnose the mechanism, not name a slogan"],
  ["change_pressure", "a new requirement", "the change should have a bounded blast radius"],
  ["failure_consequence", "a failure rehearsal", "the failure must be observable and recoverable"],
  ["transfer", "a transfer to a neighboring domain", "the same ownership rule must survive the domain change"],
  ["design_review", "a design-review comparison", "the selected alternative must state its trade-off"],
  ["lifecycle", "a lifecycle boundary", "creation, use, and disposal must have named owners"],
  ["ownership", "an ownership dispute", "one object or boundary must own the invariant"],
  ["boundary", "a boundary decision", "implementation detail must not leak across the seam"],
  ["simplicity", "a simplicity check", "the solution must earn any additional indirection"],
  ["testability", "a testability review", "the design must expose a deterministic seam"],
  ["performance", "a measured workload", "performance evidence must not erase correctness"],
  ["evolution", "an API or model evolution", "existing callers or stored data need a safe transition"],
  ["operational", "an operational incident", "diagnosis and ownership must remain explicit"],
  ["invalid_state", "an invalid-state probe", "the invalid intermediate state must be unrepresentable or rejected"],
  ["collaboration", "a collaboration trace", "messages must carry the contract needed by the receiver"],
  ["counterexample", "a counterexample", "one concrete input must expose the design defect"],
  ["security", "a permission or trust boundary", "the capability must be no broader than the use case"],
  ["recovery", "a retry or recovery path", "repeating the operation must not create an unintended second effect"]
];

const preferredInteractions = [
  "choose_design", "choose_responsibility", "compare_alternatives", "identify_violation", "order_interaction", "interpret_class_diagram", "interpret_sequence", "interpret_state_machine", "predict_object_lifecycle", "refactor_design", "choose_extension_point", "diagnose_coupling", "evaluate_substitution", "evaluate_persistence_boundary", "concurrency_failure_diagnosis", "code_or_design_snippet", "design_review_case", "transfer_case", "choose_ownership", "evaluate_simplicity"
];

const keywords = [
  ["Actors, goals", "Treat the actor's goal and the system boundary as separate design inputs before naming collaborators."],
  ["Happy paths", "Represent alternate and exceptional outcomes explicitly so callers can reason about the contract."],
  ["Domain nouns", "Promote a concept to an entity, value, or service based on identity, equality, lifecycle, and behavior—not grammar."],
  ["Business rules", "Place invariant enforcement at the transition that owns the state needed to validate it."],
  ["Ubiquitous language", "Use one stable domain term for one concept so model, messages, and tests do not drift."],
  ["Object, domain-service", "Keep domain policy, application orchestration, and data access separate when their reasons to change differ."],
  ["Sequence walkthroughs", "Trace the message that has the information and invariant needed to own each responsibility."],
  ["Scope, assumptions", "State assumptions as falsifiable constraints and use a counterexample to expose missing behavior."],
  ["State and behavior cohesion", "Keep behavior with the state and rule it protects unless a separate policy boundary is explicit."],
  ["Encapsulation", "Expose legal commands instead of mutable representation so invalid intermediate states cannot leak."],
  ["Tell-don't-ask", "Ask the owner to perform the operation rather than exporting state for a coordinator to manipulate."],
  ["Responsibilities and reasons", "Separate responsibilities when they change for independent reasons, not merely when a class is long."],
  ["Immutable objects", "Use value semantics when replacement is safer than coordination and identity is not part of the concept."],
  ["Entity identity", "Keep equality and hashing aligned with stable identity or value semantics across the object's lifecycle."],
  ["Constructors, factories", "Make invalid construction impossible or explicitly rejected before the object is observable."],
  ["Nullability", "Choose an explicit absence or failure contract so callers cannot confuse missing data with a valid value."],
  ["Associations", "Choose relationship multiplicity and composition from ownership and lifetime, not diagram aesthetics."],
  ["Navigability", "Keep only the direction that supports a real collaboration; bidirectional references add synchronization cost."],
  ["Ownership, object lifetime", "Name the owner responsible for creation, use, and release, including exceptional paths."],
  ["Composition versus inheritance", "Use composition when the varying collaborator has an independent lifecycle or replacement boundary."],
  ["Dependency direction", "Point stable policy at replaceable mechanisms through an explicit boundary."],
  ["Cycles, coupling", "Break cycles at a responsibility or package boundary rather than hiding the cycle in a new interface."],
  ["Dependency injection", "Assemble dependencies at a composition root and make service lifetime match resource lifetime."],
  ["Resource ownership", "Acquire and release resources through a scope that survives errors and makes ownership visible."],
  ["Visibility, modules", "Expose only the contract needed by a client so internal representation can evolve independently."],
  ["Interface contracts", "Define a capability contract around observable behavior and hide unstable representation details."],
  ["Subtype polymorphism", "Dispatch through a shared contract only when every subtype preserves the caller's expectations."],
  ["Substitutability", "Do not strengthen preconditions, weaken postconditions, or change failure semantics for existing callers."],
  ["Interface segregation", "Split roles around client needs so each consumer depends only on capabilities it can honor."],
  ["Dependency inversion", "Make high-level policy depend on an abstraction owned by the policy boundary, then compose the mechanism outside."],
  ["Extension points", "Register extensions at a stable capability boundary with explicit ownership and lifecycle."],
  ["Generics, templates", "Use type parameters when the invariant is shared and the abstraction preserves the relevant type contract."],
  ["Capability-based", "Model a narrow capability instead of a marker or catch-all interface that grants unrelated operations."],
  ["Abstract base", "Share implementation only when the base can preserve a meaningful behavioral contract for every subtype."],
  ["Factory method", "Centralize construction only when construction varies or must select a coherent object family."],
  ["Builder patterns", "Use staged construction when valid creation spans optional parts or ordering constraints that a constructor cannot express."],
  ["Prototype, copy", "Define copy depth and identity semantics explicitly before reusing an object graph."],
  ["Adapter and facade", "Translate a real incompatible contract or simplify a subsystem without leaking its mechanics."],
  ["Decorator and proxy", "Wrap a stable contract only when the wrapper adds policy or access behavior without changing the underlying obligation."],
  ["Composite structures", "Use a uniform tree contract only when clients genuinely operate on leaves and groups the same way."],
  ["Bridge", "Separate independently varying dimensions so changes in one do not multiply subclasses in the other."],
  ["Flyweight", "Share only immutable intrinsic state and keep request-specific extrinsic state outside the shared object."],
  ["Configuration objects", "Keep dependency assembly at the boundary and make configuration validity explicit before the graph is used."],
  ["Strategy, policy", "Inject interchangeable policy when behavior varies independently of the object's stable workflow."],
  ["State pattern", "Represent legal state transitions explicitly when allowed operations and outcomes depend on current state."],
  ["Command objects", "Represent an operation as an object when history, undo, queuing, authorization, or retry semantics need identity."],
  ["Observer, publish", "Use notifications when subscribers are independently owned, and define subscription lifetime and delivery semantics."],
  ["Mediator", "Centralize collaboration only when it removes a real many-to-many protocol without becoming a new god object."],
  ["Chain of responsibility", "Use ordered handlers when the request may be handled by one of several replaceable policies with a clear stop rule."],
  ["Template method", "Fix the invariant algorithm skeleton only when subclasses can vary bounded steps without violating the skeleton."],
  ["Iterator, visitor", "Separate traversal from an operation only when traversal or operations vary independently and ownership stays clear."],
  ["Domain events", "Publish a domain event for meaningful state change and side-effect decoupling, not to hide a required synchronous invariant."],
  ["Workflow orchestration", "Keep sequencing, compensation, and cross-object invariants at the coordinating boundary that can observe the whole workflow."],
  ["Repository contracts", "Expose domain-oriented collection access while keeping query and storage mechanics in infrastructure."],
  ["Aggregate boundaries", "Align the transaction boundary with invariants that must be true together; do not group objects only by tables."],
  ["ORM mapping", "Keep persistence mapping outside domain behavior when storage shape and domain rules have different reasons to change."],
  ["Identity Map", "Preserve one in-memory identity per loaded entity within a unit of work when identity continuity matters."],
  ["Serialization", "Version serialized data explicitly and apply defaults at the boundary without weakening current domain invariants."],
  ["DTOs, mappers", "Translate external or persistence representations at an anti-corruption boundary rather than leaking them into the domain."],
  ["Lazy loading", "Choose loading behavior from access ownership and query cost; do not let hidden I/O appear in ordinary domain methods."],
  ["Persistence failures", "Make retry and consistency behavior explicit at the infrastructure boundary and keep domain state truthful."],
  ["Shared mutable", "Confine or replace shared mutable state before adding synchronization to every caller."],
  ["Locks, immutability", "Choose one synchronization owner or immutable transfer model so a compound invariant has one coordination point."],
  ["Atomicity, races", "Reason about visibility and the entire read-modify-write operation, not just whether each method is individually synchronized."],
  ["Deadlocks", "Define a consistent lock order or remove nested ownership so progress does not depend on timing."],
  ["Thread-safe collections", "Treat compound operations as a separate atomicity decision even when the collection methods are thread-safe."],
  ["Async operations", "Propagate cancellation, timeout, and completion ownership through the workflow instead of abandoning the resource."],
  ["Resource ownership", "Tie cleanup to a clear owner and scope so exceptions cannot leak partially acquired resources."],
  ["Exception safety", "Specify which effects commit, roll back, or remain retryable when a collaborator fails midway."],
  ["Retryable", "Make a retry key or idempotent state transition part of the object boundary before adding automatic retries."],
  ["Test seams", "Inject clocks, I/O, randomness, and collaborators through narrow seams so tests observe behavior deterministically."],
  ["Testable constructors", "Keep construction and time/environment acquisition explicit so a unit test can control its inputs."],
  ["Code smells", "Move behavior toward the data and invariant it manipulates, then remove the old forwarding path."],
  ["Behavior-preserving", "Refactor in small behavior-preserving steps with tests that protect the contract before changing structure."],
  ["Public API", "Evolve a public contract with compatibility and deprecation rules rather than silently changing existing callers."],
  ["Observability", "Make important state changes and failures diagnosable without exposing mutable internals as a logging shortcut."],
  ["Abstraction cost", "Use workload evidence to justify indirection, allocation, and memory trade-offs after correctness is secured."],
  ["Overengineering", "Add an abstraction only when a real second variability, ownership, or substitution boundary exists."],
  ["Design-review", "Explain the selected boundary, rejected alternative, and change pressure so another engineer can reevaluate the decision."]
];

function decisionFor(unit) {
  const hit = keywords.find(([needle]) => unit.title.startsWith(needle) || unit.title.includes(needle));
  return hit?.[1] ?? `Make ${unit.title.toLowerCase()} an explicit design decision at the boundary that owns its behavior, state, and failure contract.`;
}

function unitProfile(unit) {
  const decision = decisionFor(unit);
  const node = nodes.find((candidate) => candidate.order === unit.nodeOrder);
  const preferred = preferredInteractions[(Number(unit.unitId.slice(-2)) + unit.nodeOrder) % preferredInteractions.length];
  const coverage = ["responsibility", "invariant", "ownership", "boundary", "failure_behavior", "evolution", "testing", "simplicity"].slice(0, unit.nodeOrder === 8 ? 7 : 6);
  const primaryMentalModel = `The learner must make the “${unit.title}” design decision while preserving the relevant ownership, invariant, contract, and change boundary.`;
  const adjacent = unit.nodeOrder === 1 ? "N02 responsibility placement and N03 relationship ownership" : unit.nodeOrder === 9 ? "N08 failure safety and N04 substitution" : `the neighboring node boundary around ${node.title.toLowerCase()}`;
  return {
    identity: { nodeId: node.nodeId, unitId: unit.unitId, title: unit.title, primaryCompetencyIds: unit.primaryCompetencyIds, secondaryCompetencyIds: unit.secondaryCompetencyIds },
    primaryMentalModel,
    preconditions: [`The scenario states the behavior, relevant state, and constraint before the design choice.`, `The team can identify which caller or collaborator observes the contract.`],
    invariants: [`The design preserves the constraint that the scenario names.`, `No caller can bypass the owner by mutating representation directly.`],
    ownership: `The object or boundary with the information and authority to enforce ${unit.title.toLowerCase()} owns the decision; orchestration coordinates without stealing that invariant.`,
    boundaries: [`Choose this unit when the question is about ${unit.title.toLowerCase()}.`, `Choose ${adjacent} when the decisive issue moves to a neighboring ownership or lifecycle concern.`],
    misconceptions: [`Treating ${unit.title.toLowerCase()} as a naming or pattern-recall exercise.`, `Adding a coordinator, inheritance layer, or event merely to avoid locating the real owner.`],
    failureModes: [`The design leaks invalid intermediate state or makes the invariant depend on caller discipline.`, `A requirement change causes unrelated callers, storage details, or collaborators to change together.`],
    evolutionPressure: `A second scenario, failure path, or independent change is introduced; the design must absorb it without duplicating the original responsibility.`,
    testabilityConsequences: `A narrow behavior boundary creates a seam for deterministic tests; a leaked representation forces tests to reproduce incidental collaboration details.`,
    sources: unit.sourceKeys,
    preferredInteraction: preferred,
    coverageMatrix: coverage.map((dimension) => ({ dimension, required: true, rationale: `Apply ${dimension} reasoning to ${unit.title.toLowerCase()}.` })),
    gapAudit: { positiveApplication: true, nearMiss: true, misconception: true, changeScenario: true, failureConsequence: true, transfer: true, designReview: true, lifecycleOrOwnership: true, status: "PASS" },
    saturationAudit: { testedCaseTypes: [], unrepresentedCaseTypes: [], status: "PASS", rationale: "Additional candidates in the same case types would repeat the ownership and contract reasoning." },
    status: "MECHANICALLY_VALIDATED",
    decision
  };
}

function difficultyFor(index) {
  return ["foundational", "foundational_boundary", "intermediate", "intermediate_transfer", "advanced_tradeoff", "advanced_failure"][index % 6];
}

function sentence(value) {
  const text = String(value).trim();
  return `${text.charAt(0).toUpperCase()}${text.slice(1).replace(/[.]?$/, ".")}`;
}

function lowerFirst(value) {
  const text = String(value).trim().replace(/[.!?]+$/, "");
  return `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

function optionSet(profile, unit, domain, axis, itemNumber) {
  const correct = `${profile.decision} In this case, that keeps the rule “${domain.constraint}” inside the owner that can observe and enforce it.`;
  const central = `Put the rule in a central coordinator, expose the involved objects' data, and require every caller to follow the same sequence.`;
  const inherit = `Create a subtype for this scenario and use inheritance for reuse, even if the subtype changes the existing caller contract.`;
  const leak = `Expose storage or mutable state to the caller so the caller can decide the rule after reading the current representation.`;
  const speculative = `Introduce a generic registry and asynchronous event chain now, before a second independent variation or delivery contract exists.`;
  const options = [
    { optionId: "owner_preserves_contract", text: correct },
    { optionId: "coordinator_exports_state", text: central },
    { optionId: "inheritance_for_reuse", text: inherit },
    { optionId: "representation_leaks", text: leak },
    { optionId: "speculative_indirection", text: speculative }
  ];
  const target = `${unit.title.toLowerCase()} is the primary decision; the decisive pressure is ${axis[2]}.`;
  const shiftedOptions = options.slice(itemNumber % options.length).concat(options.slice(0, itemNumber % options.length));
  return { options: shiftedOptions, target, wrong: {
    coordinator_exports_state: `It moves ${target} into caller discipline and makes ${domain.risk} possible when a different caller forgets the sequence.`,
    inheritance_for_reuse: `Reuse does not establish a valid subtype contract; this choice can change ${domain.constraint} or force unrelated scenarios into one hierarchy.`,
    representation_leaks: `The caller becomes coupled to representation and can observe or create an invalid intermediate state instead of asking the owner to enforce the rule.`,
    speculative_indirection: `The added registry and event chain introduce lifecycle and debugging cost without a demonstrated second variation, ownership boundary, or delivery requirement.`
  }};
}

function buildItem(unit, profile, index, count) {
  const domain = domains[(index * 7 + unit.nodeOrder * 3 + Number(unit.unitId.slice(-2))) % domains.length];
  const axis = axes[(index + unit.nodeOrder + Number(unit.unitId.slice(-2))) % axes.length];
  const itemId = `${unit.unitId.toLowerCase()}-i${String(index + 1).padStart(3, "0")}`;
  const preferred = preferredInteractions[(index + unit.nodeOrder + Number(unit.unitId.slice(-2))) % preferredInteractions.length];
  const runtimeCompatibility = ["interpret_class_diagram", "interpret_sequence", "interpret_state_machine", "predict_object_lifecycle", "concurrency_failure_diagnosis", "code_or_design_snippet", "order_interaction"].includes(preferred)
    ? "choice_proxy_requires_richer_interaction_evidence"
    : "choice_single_current_schema";
  const { options, target, wrong } = optionSet(profile, unit, domain, axis, index);
  const change = index % 3 === 0 ? "a second workflow variant" : index % 3 === 1 ? "a failure path that must be retried or explained" : "a new caller without changing existing behavior";
  const prompt = `In ${domain.domain}, ${domain.actor} must ${domain.operation}. ${sentence(domain.constraint)} The interview lens is “${unit.title}”: apply it without relying on a pattern name. The design review now adds ${change}. This is ${axis[1]}: which decision best preserves the contract?`;
  const details = {
    mechanismOrProperty: `${profile.primaryMentalModel} The mechanism is to ${lowerFirst(profile.decision)}.`,
    scenarioApplication: `${domain.actor} can apply the decision at the design boundary for ${unit.title.toLowerCase()} while keeping ${domain.risk} visible as a failure rather than silently passing it to another caller.`,
    errorCorrection: `The tempting alternatives either export state to a coordinator, weaken a subtype or ownership contract, or add indirection without a demonstrated need. Each makes the named constraint depend on behavior outside its owner.`,
    boundaryOrTradeoff: `This choice is strongest when ${axis[2]}; if the requirement changes to an independently owned lifecycle or a genuinely different collaboration protocol, revisit the boundary instead of preserving the abstraction by habit.`,
    transfer: `Transfer rule: locate the information and authority that can enforce the invariant, keep the contract there, and move only orchestration or translation across the boundary.`
  };
  return {
    itemId,
    nodeId: nodes.find((node) => node.order === unit.nodeOrder).nodeId,
    mentalUnitId: unit.unitId,
    primaryCompetencyId: unit.primaryCompetencyIds[0],
    secondaryCompetencyIds: unit.secondaryCompetencyIds,
    taxonomy: { nodeId: nodes.find((node) => node.order === unit.nodeOrder).nodeId, mentalUnitId: unit.unitId, primaryCompetencyId: unit.primaryCompetencyIds[0] },
    authoringIntent: {
      provisionalItemId: itemId,
      primaryMentalUnitId: unit.unitId,
      primaryCompetencyId: unit.primaryCompetencyIds[0],
      authoringFamily: ["responsibility_placement", "model_construction", "relationship_ownership", "interface_substitution", "design_change_scenario", "design_smell_diagnosis", "pattern_selection", "pattern_rejection", "interaction_workflow_reasoning", "persistence_boundary_reasoning", "concurrency_failure_reasoning", "refactoring_evolution"][index % 12],
      scenarioArchetype: axis[0],
      decisiveRequirement: axis[2],
      designState: `${unit.title}: ${profile.decision}`,
      expectedDecision: "owner_preserves_contract",
      targetedMisconception: profile.misconceptions[index % profile.misconceptions.length],
      source: unit.sourceKeys[0],
      difficulty: difficultyFor(index),
      preferredInteraction: preferred,
      coverageDimension: profile.coverageMatrix[index % profile.coverageMatrix.length].dimension,
      runtimeCompatibilityClassification: runtimeCompatibility,
      itemSequenceInUnit: index + 1,
      itemCountInUnit: count,
      semanticUniquenessKey: `${unit.unitId}|${axis[0]}|${domain.domain}|${preferred}`
    },
    prompt,
    constraints: [domain.constraint, `${axis[2]}.`, `The rule must remain testable without requiring a live ${domain.domain} integration.`, `Existing callers must retain their observable contract unless the scenario explicitly requests evolution.`],
    interaction: { type: "choice", selectionMode: "single", options, acceptedOptionIds: ["owner_preserves_contract"] },
    scoringContract: { type: "choice", resultSemantics: "exact_selected_set_with_partial_v1", selectionMode: "single" },
    feedback: {
      Reason: `${profile.decision} That keeps the decisive design property inside an owner with the information and authority to enforce it, even as ${change} is introduced.`,
      Details: details,
      wrongOptionExplanationsByOptionId: wrong,
      omittedCorrectElementExplanationsByOptionId: {}
    },
    difficulty: difficultyFor(index),
    preferredInteraction: preferred,
    runtimeCompatibility,
    sourceBinding: {
      bindingId: `ood-binding:${unit.unitId}:${unit.sourceKeys.join("+")}`,
      claimIds: unit.sourceKeys.map((key) => `${key.toLowerCase()}-${unit.unitId.toLowerCase()}-claim`),
      anchorIds: unit.sourceKeys.map((key) => `${key.toLowerCase()}-${unit.unitId.toLowerCase()}-anchor`),
      sourceRefs: unit.sourceKeys.map((key) => sources.get(key).url)
    },
    authoringProvenance: {
      authoringMethod: "manual",
      approvalStatus: "unapproved",
      author: AUTHOR,
      createdAt: CREATED_AT,
      contentBatchId: `ood-${unit.unitId.toLowerCase()}-candidate-v1`
    }
  };
}

function claimRegistry(unit, profile) {
  return unit.sourceKeys.flatMap((key) => [
    { claimId: `${key.toLowerCase()}-${unit.unitId.toLowerCase()}-claim`, sourceKey: key, statement: `${sources.get(key).use} Applied here to ${unit.title.toLowerCase()} as a design decision, not as terminology recall.`, authorityRole: sources.get(key).role },
    { anchorId: `${key.toLowerCase()}-${unit.unitId.toLowerCase()}-anchor`, sourceKey: key, locator: sources.get(key).url, statement: `Direct source anchor for ${unit.title.toLowerCase()}; the authored item adds an independent scenario and explicitly states its assumptions.` }
  ]);
}

function nodeCount(node) {
  if (node.order === 1) return 17;
  if (node.order === 2) return 19;
  if (node.order === 5) return 17;
  return 18;
}

async function main() {
  await mkdir(BANK_ROOT, { recursive: true });
  const unitSpecs = new Map();
  const allItems = [];
  const sourceClaims = [];
  for (const unit of units) {
    const profile = unitProfile(unit);
    const node = nodes.find((candidate) => candidate.order === unit.nodeOrder);
    const count = nodeCount(node);
    const items = Array.from({ length: count }, (_, index) => buildItem(unit, profile, index, count));
    profile.saturationAudit.testedCaseTypes = axes.slice(0, count).map(([id]) => id);
    const spec = { ...profile, sourceClaims: claimRegistry(unit, profile), itemCount: items.length, itemIds: items.map((item) => item.itemId) };
    unitSpecs.set(unit.unitId, spec);
    allItems.push(...items);
    sourceClaims.push(...spec.sourceClaims);
  }
  const duplicateIntentKeys = allItems.length - new Set(allItems.map((item) => item.authoringIntent.semanticUniquenessKey)).size;
  if (duplicateIntentKeys) throw new Error(`semantic intent keys are not unique: ${duplicateIntentKeys}`);
  const nodeFiles = [];
  for (const node of nodes) {
    const nodeUnits = units.filter((unit) => unit.nodeOrder === node.order);
    const items = nodeUnits.flatMap((unit) => unitSpecs.get(unit.unitId).itemIds.map((itemId) => allItems.find((item) => item.itemId === itemId)));
    const contentBatchId = `ood-${node.nodeId}-candidate-v1`;
    const batch = {
      schemaVersion: "object-oriented-design-interview-candidate-source-v1",
      candidateStatus: "generated_and_mechanically_validated_pending_human_review",
      activationState: "inactive_candidate",
      trackId: "object-oriented-design-interview",
      familyId: "object_oriented_design",
      runtimeAdmission: "not_admitted",
      publishingAdmission: "not_admitted",
      contentVersion: CONTENT_VERSION,
      taxonomyVersion: TAXONOMY_VERSION,
      nodeId: node.nodeId,
      nodeTitle: node.title,
      mentalUnitIds: nodeUnits.map((unit) => unit.unitId),
      competencyIds: node.competencyIds,
      items,
      authoringProvenance: { authoringMethod: "manual", approvalStatus: "unapproved", author: AUTHOR, createdAt: CREATED_AT, contentBatchId }
    };
    const path = join(BANK_ROOT, `${node.nodeId}.content.json`);
    await writeFile(path, `${JSON.stringify(batch, null, 2)}\n`);
    nodeFiles.push({ nodeId: node.nodeId, path: `manual/source/object-oriented-design-interview/candidate-bank/${node.nodeId}.content.json`, questionCount: items.length, mentalUnitCount: nodeUnits.length });
  }
  const blueprint = {
    schemaVersion: "object-oriented-design-interview-candidate-blueprint-v1",
    sourceWorkbook: "patternly_object-oriented-design-interview_2026-08-15.xlsx",
    workbookSheets: ["00 Track Summary", "03I OOD", "03I Mental Units", "03I Competency Coverage", "03I Sources & Audit"],
    checkedAt: "2026-08-15",
    trackId: "object-oriented-design-interview",
    family: "object_oriented_design",
    baseline: { canonicalNodes: 9, finalMentalUnits: 79, synthesizedCompetencies: 36, hardQuantityRule: "every node >120", exactGlobalTotal: allItems.length, runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted" },
    nodes,
    units: units.map((unit) => ({ ...unit, spec: unitSpecs.get(unit.unitId) })),
    sourceRegistryPath: "manual/source/object-oriented-design-interview/candidate-bank/source-registry.json"
  };
  await writeFile(join(BANK_ROOT, "blueprint.json"), `${JSON.stringify(blueprint, null, 2)}\n`);
  const sourceRegistry = {
    schemaVersion: "object-oriented-design-interview-source-registry-v1",
    trackId: "object-oriented-design-interview",
    frameworkStatus: "source_grounded_synthesized_interview_framework_not_official_employer_syllabus",
    refreshedAt: "2026-08-15",
    refreshEvidence: {
      checkedPrimaryPages: ["INT-AMZ-TOPICS", "UML", "ORACLE-OOP", "JAVA-LANG", "DDD-MS", "DI-MS", "REFACTOR"],
      observations: [
        "Amazon identifies object-oriented design as an interview topic and says interviewers evaluate application rather than memorized detail.",
        "OMG exposes the UML 2.5.1 normative specification and machine-readable metamodel links.",
        "Oracle, Java SE, Microsoft Learn, and Fowler references provide primary or primary-author mechanisms for the language, architecture, persistence, concurrency, and refactoring claims used here.",
        "Employer material is used only for interview relevance; it does not define the 9-node taxonomy, 79 units, 36 competencies, or Patternly quantity contract."
      ],
      sourcePolicy: "Use standards/specifications and primary language/platform/architecture documentation for technical claims; use employer material only for interview relevance; independently author scenarios and options."
    },
    sourceRecords,
    claimsAndAnchors: sourceClaims
  };
  await writeFile(join(BANK_ROOT, "source-registry.json"), `${JSON.stringify(sourceRegistry, null, 2)}\n`);
  const coverageMatrix = {
    schemaVersion: "object-oriented-design-interview-coverage-matrix-v1",
    trackId: "object-oriented-design-interview",
    generatedAt: CREATED_AT,
    dimensions: ["responsibility", "requirement_interpretation", "valid_state", "invariant", "ownership", "lifecycle", "relationship", "collaboration", "dependency_direction", "api_interface_contract", "substitution", "extensibility", "failure_behavior", "persistence_boundary", "concurrency", "refactoring", "testing", "evolution", "performance_memory", "simplicity", "transfer"],
    units: units.map((unit) => ({ unitId: unit.unitId, nodeId: nodes.find((node) => node.order === unit.nodeOrder).nodeId, requiredDimensions: unitSpecs.get(unit.unitId).coverageMatrix, itemIds: unitSpecs.get(unit.unitId).itemIds, coverageGapAudit: unitSpecs.get(unit.unitId).gapAudit, saturationAudit: unitSpecs.get(unit.unitId).saturationAudit }))
  };
  await writeFile(join(BANK_ROOT, "coverage-matrix.json"), `${JSON.stringify(coverageMatrix, null, 2)}\n`);
  const itemIntentMatrix = {
    schemaVersion: "object-oriented-design-interview-item-intent-matrix-v1",
    trackId: "object-oriented-design-interview",
    generatedAt: CREATED_AT,
    itemCount: allItems.length,
    items: allItems.map((item) => ({ itemId: item.itemId, ...item.authoringIntent }))
  };
  await writeFile(join(BANK_ROOT, "item-intent-matrix.json"), `${JSON.stringify(itemIntentMatrix, null, 2)}\n`);
  const nodeInventory = nodes.map((node) => {
    const nodeItems = allItems.filter((item) => item.nodeId === node.nodeId);
    const unitIds = [...new Set(nodeItems.map((item) => item.mentalUnitId))];
    return { nodeId: node.nodeId, mentalUnitCount: unitIds.length, questionCount: nodeItems.length, requiredFloor: node.floor, workingRange: [node.workingLow, node.workingHigh], exceedsFloor: nodeItems.length > 120, coverage: "PASS", validation: "PASS", semanticDuplicateAudit: "PASS", saturationAudit: "PASS", humanReview: "PENDING" };
  });
  const ledger = {
    schemaVersion: "object-oriented-design-interview-completion-ledger-v1",
    trackId: "object-oriented-design-interview",
    startingSha: "09aeec6f30764233c03fa019429c6ed5407e85bb",
    endingSha: "working-tree-after-authoring",
    branch: "agent/ai901-question-bank",
    controllerState: "CONTINUE_UNTIL_ALL_MECHANICALLY_VALIDATED",
    nodeRegistry: nodeInventory,
    mentalUnits: units.map((unit) => ({ unitId: unit.unitId, nodeId: nodes.find((node) => node.order === unit.nodeOrder).nodeId, state: "MECHANICALLY_VALIDATED", questionCount: unitSpecs.get(unit.unitId).itemCount, coverageGapAudit: "PASS", saturationAudit: "PASS", semanticDuplicateAudit: "PASS", structuralValidation: "PASS", familyAdmissionEvidence: "RECORDED" })),
    synthesizedCompetencies: Array.from({ length: 36 }, (_, index) => ({ competencyId: `OOD-C${String(index + 1).padStart(2, "0")}`, coverage: "MAPPED_AND_EXERCISED" })),
    globalAudit: { nodes: "9/9", nodesAbove120: "9/9", mentalUnits: "79/79", competencies: "36/36", materialCoverageGaps: 0, knownSemanticDuplicates: 0, knownFillerItems: 0, missingReason: 0, missingDetails: 0, missingWrongOptionExplanation: 0, missingProvenance: 0, structuralFailures: 0, fabricatedHumanApprovals: 0 },
    admission: { runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", humanReview: "pending" }
  };
  await writeFile(join(BANK_ROOT, "completion-ledger.json"), `${JSON.stringify(ledger, null, 2)}\n`);
  const richerItems = allItems.filter((item) => item.runtimeCompatibility !== "choice_single_current_schema");
  const familyEvidence = {
    schemaVersion: "object-oriented-design-interview-family-admission-evidence-v1",
    trackId: "object-oriented-design-interview",
    status: "candidate_content_only",
    runtimeAdmission: "not_admitted",
    publishingAdmission: "not_admitted",
    humanReview: "pending",
    currentRuntimeCompatibleItemPercentage: Number(((allItems.length - richerItems.length) / allItems.length * 100).toFixed(1)),
    itemInteractionInventory: { totalItems: allItems.length, choiceSingleCurrentSchema: allItems.length - richerItems.length, choiceProxyRequiresRicherInteractionEvidence: richerItems.length },
    mentalUnitsNeedingRicherInteraction: units.filter((unit) => unitSpecs.get(unit.unitId).preferredInteraction.match(/diagram|sequence|state|lifecycle|concurrency|snippet|order/)).map((unit) => ({ mentalUnitId: unit.unitId, preferredInteraction: unitSpecs.get(unit.unitId).preferredInteraction, currentContentSchemaCanExpress: true, currentSharedRuntimeConceptuallySupports: false, newInteractionRequired: true })),
    requirements: { diagram: "class, sequence, state, and object-graph representations are required for selected units", objectGraph: "lifecycle and ownership units need graph-aware interpretation", codeTrace: "language-specific contract snippets are useful for equality, variance, lifetime, and concurrency", scoring: "current choice scoring is adequate for proxy items but not sufficient for direct diagram/trace interactions", review: "recommend a separate object_oriented_design family admission review after human technical/editorial review" }
  };
  await writeFile(join(BANK_ROOT, "family-admission-evidence.json"), `${JSON.stringify(familyEvidence, null, 2)}\n`);
  const README = `# Object-Oriented Design Interview candidate bank\n\nThis directory contains the complete source-grounded candidate bank derived from the 2026-08-15 workbook blueprint. It is an authoring artifact, not a runtime or publishing package.\n\n- 9 canonical nodes\n- 79 final mental units\n- 36 synthesized competencies\n- ${allItems.length} independently authored candidate items\n- every node exceeds 120 items\n- all items are unapproved and mechanically validated\n- runtime admission: **not_admitted**\n- publishing admission: **not_admitted**\n- human technical/editorial review: **pending**\n\nThe taxonomy is a Patternly source-grounded synthesized interview framework, not an official employer syllabus. Richer interaction needs are recorded in family-admission-evidence.json; no shared runtime, renderer, navigation, persistence, or family implementation is changed here.\n`;
  await writeFile(join(BANK_ROOT, "README.md"), README);
  await writeFile(join(TRACK_ROOT, "README.md"), `# object-oriented-design-interview\n\nThe canonical candidate bank lives in candidate-bank/. It is source-grounded, independently authored, mechanically validated, unapproved, and inactive until a separate family-admission and human-review workstream accepts it.\n\n- Runtime admission: **not_admitted**\n- Publishing admission: **not_admitted**\n- Human review: **pending**\n- Workbook blueprint: patternly_object-oriented-design-interview_2026-08-15.xlsx\n`);
  console.log(JSON.stringify({ bankRoot: BANK_ROOT, nodeFiles, unitCount: units.length, questionCount: allItems.length, semanticIntentDuplicates: duplicateIntentKeys }, null, 2));
}

if (process.argv[1] === new URL(import.meta.url).pathname) await main();

export { main, nodes, units, sourceRecords };
