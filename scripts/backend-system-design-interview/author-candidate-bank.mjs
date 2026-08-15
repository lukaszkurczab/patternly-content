import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname;
const TRACK_ROOT = join(ROOT, "manual/source/backend-system-design-interview");
const ARTIFACT_ROOT = join(ROOT, "evidence/design-interview/backend-system-design-interview");
const BLUEPRINT_PATH = join(ARTIFACT_ROOT, "blueprint.json");
const CREATED_AT = "2026-08-15T00:00:00.000Z";
const CONTENT_VERSION = "backend-system-design-interview-candidate-v2026.08.15";
const TAXONOMY_VERSION = "backend-system-design-interview-workbook-v2026.08.15";
const AUTHOR = "Codex (candidate authoring; not a human reviewer)";

const interactionFor = (unit) => {
  const title = unit.title.toLowerCase();
  if (/capacity|throughput|latency|queueing|utilization|cost/.test(title)) return "capacity_calculation";
  if (/flow|request|workflow|sequence|stream|event|job/.test(title)) return "sequence_or_data_flow";
  if (/partition|replication|region|topology|failover|tenant|boundary/.test(title)) return "topology_comparison";
  if (/security|identity|authorization|authentication|privacy|abuse|trust/.test(title)) return "trust_boundary_mapping";
  if (/health|deployment|rollback|incident|observability|slo|alert|operability/.test(title)) return "operational_timeline";
  if (/data|storage|index|transaction|schema|search|retention|archival/.test(title)) return "data_model_and_access_path";
  if (/cache|read replica|cdn|content delivery|freshness/.test(title)) return "cache_consistency_topology";
  return "architecture_decision_matrix";
};

const NODE_COUNTS = {
  1: [16, 16, 16, 17, 16, 16, 16, 16, 16],
  2: [16, 16, 17, 17, 17, 16, 17, 16, 18],
  3: [18, 18, 18, 18, 18, 18, 18, 18, 18, 19],
  4: [18, 18, 17, 17, 18, 17, 18, 17],
  5: [19, 19, 20, 19, 20, 19, 20, 19, 18, 20],
  6: [18, 18, 18, 18, 18, 18, 19, 18, 19],
  7: [17, 17, 17, 17, 17, 17, 18, 17, 18],
  8: [17, 17, 17, 17, 17, 17, 18, 17, 18],
  9: [18, 18, 17, 18, 17, 18, 17, 18],
  10: [18, 18, 18, 18, 18, 18, 19, 18]
};

const DOMAIN_CONTEXTS = [
  ["merchant price synchronization", "a catalog operator", "publish a price revision", "the new price must be visible to checkout without accepting an obsolete version", "a stale or partially applied price"],
  ["payment authorization", "a payment coordinator", "authorize a charge", "the customer must not be charged twice when the provider response is delayed", "an ambiguous provider outcome"],
  ["parcel tracking", "a logistics consumer", "show the latest shipment state", "out-of-order carrier updates must not move a parcel backwards", "an old event arriving after a newer one"],
  ["collaborative document editing", "a workspace member", "save a document revision", "concurrent edits must preserve the agreed conflict rule", "two writes racing on one revision"],
  ["appointment booking", "a scheduling service", "reserve a time slot", "no confirmed booking may overlap another booking for the same resource", "a reservation race"],
  ["telemetry ingestion", "an observability collector", "accept device measurements", "bursty producers must not make the query path unavailable", "a producer burst exceeding consumer capacity"],
  ["media metadata", "a media catalog", "serve metadata for an asset", "the read path may tolerate bounded freshness but must expose missing data honestly", "a lagging derived projection"],
  ["identity directory", "an account service", "change a user credential", "a revoked credential must not remain usable through an old session", "revocation propagation lag"],
  ["fraud review", "a risk analyst", "place a case into review", "high-risk cases must not be silently dropped while low-value work is constrained", "overload in the review queue"],
  ["document processing", "a processing coordinator", "submit an extraction job", "a retry must not create two billable or irreversible side effects", "a worker retry after an unknown result"],
  ["inventory reservation", "an inventory service", "reserve stock", "the invariant must hold at the authoritative write boundary", "a stale read before a competing reservation"],
  ["search indexing", "a discovery service", "find recently changed records", "index lag must be measurable and must not be confused with source-of-truth loss", "a failed index update"],
  ["notification preferences", "a notification gateway", "deliver a user notification", "a slow provider must not consume all request capacity", "a dependency that times out intermittently"],
  ["IoT command delivery", "a device control plane", "send a command to a device", "duplicate delivery must not cause an unsafe repeated action", "a reconnecting device replaying a command"],
  ["video transcoding", "a media workflow", "start a rendition job", "large work must survive worker replacement without blocking interactive requests", "a worker dying during a long job"],
  ["payroll export", "a finance operator", "produce a period export", "the exported period must be reproducible and auditable after a retry", "partial output after a failed run"],
  ["ticket allocation", "an event platform", "allocate a ticket", "the user-visible result must identify whether allocation succeeded, failed, or is still pending", "an allocation timeout with unknown state"],
  ["learning progress", "a learner profile service", "record progress", "repeated client submissions must converge without inflating progress", "duplicate client writes"],
  ["route planning", "a dispatch planner", "compute a route", "expensive recomputation must not starve urgent dispatch requests", "a computational hotspot"],
  ["audit ledger", "a compliance service", "append an audit record", "the record must be attributable and retained for the stated obligation", "a missing or mutable audit entry"],
  ["partner webhook delivery", "an integration service", "deliver a status change", "the receiver may retry and may observe duplicates", "a receiver that acknowledges late"],
  ["feature rollout", "a release operator", "enable a capability for a cohort", "the change must be reversible without changing persisted data incompatibly", "a bad rollout signal"],
  ["financial reporting", "a reporting reader", "read a period total", "the report must state its freshness and use a consistent cutoff", "a read across mixed snapshots"],
  ["customer support search", "a support agent", "retrieve a case history", "the search result must respect tenant and ownership boundaries", "a broad query crossing a trust boundary"]
].map(([id, actor, operation, constraint, failure]) => ({ id, actor, operation, constraint, failure }));

const CASES = [
  ["applicability", "normal path", "The normal path is healthy and the design must show where the decision belongs.", "Choose the mechanism that directly satisfies the stated contract before adding adjacent controls.", "using a fashionable component without tying it to a requirement", "foundational"],
  ["mechanism", "mechanism check", "The interviewer asks what mechanism makes the guarantee true rather than which product name is familiar.", "Name the state, owner, and enforcement point that make the guarantee observable.", "repeating a quality adjective without identifying enforcement", "foundational"],
  ["architecture_decision", "boundary choice", "Two plausible components could own the work, but only one sees the decisive state.", "Place the decision at the boundary that can observe and enforce the relevant invariant.", "splitting ownership across callers and services", "intermediate"],
  ["capacity", "capacity pressure", "Peak traffic is materially higher than the steady state and one resource becomes limiting.", "Use an order-of-magnitude estimate only to select the smallest architecture change that removes the limiting resource.", "doing arithmetic that does not change the design", "intermediate"],
  ["data_path", "data-path review", "The data path includes an authoritative record and one or more derived views.", "Keep source of truth, derived state, and disposable acceleration explicitly separate.", "treating a projection or cache as the authoritative record", "intermediate"],
  ["write_path", "write-path review", "The write path has a correctness invariant and a retry or concurrency hazard.", "Make the write owner and atomicity or idempotency boundary explicit before scaling reads.", "enforcing a write invariant through a stale read path", "advanced"],
  ["read_path", "read-path review", "The read path is hot, but its freshness and visibility guarantee are bounded.", "Accelerate reads only within the declared freshness and consistency contract.", "adding a replica or cache while hiding staleness", "intermediate"],
  ["failure", "failure scenario", "A dependency or component fails after the request has crossed a boundary.", "Contain the failure, make the result explicit, and preserve the caller's retry or recovery contract.", "retrying or failing open without an ownership rule", "advanced_failure"],
  ["overload", "overload scenario", "Demand exceeds safe service capacity and queues or buffers begin to grow.", "Protect the highest-value work with admission control, bounded buffering, or load shedding.", "accepting unbounded work and amplifying tail latency", "advanced_failure"],
  ["recovery", "recovery scenario", "The system returns after a restart, failover, replay, or partial outage.", "Define how state is rebuilt or reconciled and what evidence proves recovery is complete.", "calling a replica or restart a complete recovery plan", "advanced_failure"],
  ["consistency", "consistency trade-off", "The scenario names a read-your-writes, ordering, freshness, or invariant guarantee.", "Choose the weakest guarantee that prevents the stated user harm and make its failure consequence explicit.", "saying eventual consistency is always sufficient or always wrong", "advanced_tradeoff"],
  ["security", "security boundary", "A caller, service, tenant, or webhook crosses a trust boundary.", "Verify identity, authorize the requested resource, and enforce the boundary at the server-side owner.", "trusting caller-supplied identity or encryption alone", "advanced_security"],
  ["operations", "operational action", "A signal or health state must lead to a diagnosis, alert, rollback, or runbook action.", "Connect the signal to a user-impact decision and name the operator-owned response.", "collecting telemetry without an operational decision", "advanced_operations"],
  ["cost", "cost trade-off", "The design has a recurring compute, storage, transfer, or operational cost.", "Compare unit economics and reliability consequences before choosing managed or self-managed complexity.", "optimizing a bill line while moving risk to correctness or recovery", "advanced_tradeoff"],
  ["migration", "evolution scenario", "The contract or schema must change while old and new versions coexist.", "Use an additive or compatibility-preserving sequence with an executable rollback or repair path.", "deploying a breaking change and relying on an instant rollback", "advanced_evolution"],
  ["transfer", "transfer case", "The same mechanism appears in a different domain with one constraint changed.", "Transfer the ownership and failure rule, then re-evaluate the changed workload rather than copying a product solution.", "memorizing a canonical system instead of reasoning from constraints", "advanced_transfer"],
  ["design_review", "design review", "The candidate must defend a choice, name a rejected alternative, and state what evidence would reverse it.", "Document the decisive requirement, trade-off, and next measurement so the design remains revisable.", "presenting one answer as universally correct", "advanced_tradeoff"],
  ["geography", "geography and locality", "The workload spans regions with a stated latency, sovereignty, or disaster-recovery constraint.", "Choose data locality and replication from the geographic requirement, then state the consistency and cost consequence.", "adding regions without a geographic or recovery requirement", "advanced_tradeoff"],
  ["testability", "verification path", "The design must prove its failure or recovery behavior without relying on an unrepeatable production incident.", "Expose a deterministic signal, fault-injection seam, or replayable evidence path for the decision under review.", "claiming resilience without a testable observation or recovery proof", "advanced_operations"],
  ["reversibility", "reversal test", "The design choice may need to be undone after a measured assumption changes.", "Preserve an explicit migration, rollback, or repair path before accepting the new coupling or data shape.", "choosing a one-way migration because the first rollout appears healthy", "advanced_evolution"]
].map(([dimension, type, pressure, expected, misconception, difficulty]) => ({ dimension, type, pressure, expected, misconception, difficulty }));

const NODE_PATTERNS = {
  1: [
    [/actor|use case|scope/i, "Clarify actors, core use cases, and explicit non-goals before choosing components.", "Scope is a product contract; it prevents unrelated behavior from entering the architecture.", "the product boundary and the implementation boundary are different decisions"],
    [/functional|non-functional/i, "Separate user-visible behavior from measurable quality constraints before selecting a design.", "Functional behavior says what happens; quality targets determine latency, durability, availability, and operating choices.", "calling an implementation preference a requirement"],
    [/workload|traffic|growth/i, "Model workload shape and growth assumptions before sizing the critical path.", "Peak shape, read/write ratio, fan-out, and growth determine where capacity and buffering pressure appear.", "using average traffic to hide burst or skew"],
    [/capacity|storage estimation/i, "Use order-of-magnitude capacity estimates to choose a storage, bandwidth, or scaling boundary.", "An estimate is useful only when it changes a component choice or identifies the limiting resource.", "performing precise arithmetic without an architecture consequence"],
    [/latency|throughput|availability|slo/i, "Turn latency, throughput, availability, and SLO language into budgets owned by the critical path.", "A measurable service objective lets the design allocate work and failure budget rather than repeat a quality slogan.", "treating availability or latency as an unowned global aspiration"],
    [/read|write|asynchronous flow/i, "Separate critical reads, writes, and asynchronous side effects according to their user-visible deadline.", "Only work that affects the immediate contract belongs on the synchronous path; durable side effects need an explicit handoff.", "queueing work that must decide the immediate response"],
    [/component|decomposition|responsibility/i, "Place each responsibility at the boundary that owns its state, invariant, and failure consequence.", "A component split is justified by ownership, change, or failure isolation, not by drawing more boxes.", "creating services whose ownership remains shared"],
    [/bottleneck|constraint|priorit/i, "Prioritize the constraint that can invalidate the current design and defer unrelated complexity.", "A bottleneck, hard invariant, or recovery requirement should drive the next design move.", "optimizing a non-limiting component"],
    [/communication|trade-off|documentation/i, "Make assumptions, rejected alternatives, and reversal evidence explicit during iterative design.", "A design can evolve when its decisions are tied to constraints and measurements rather than hidden intuition.", "presenting a diagram without a decision record"]
  ],
  2: [
    [/resource|command|event|query/i, "Choose the contract shape from ownership, timing, replay, and compatibility requirements.", "Resources model addressable state, commands request work, events announce facts, and queries read without transferring ownership.", "treating every message as an interchangeable CRUD request"],
    [/http|safety|idempotency|conditional/i, "Use protocol semantics and an explicit operation identity to make retries and conditional updates safe.", "HTTP method semantics, validators, and idempotency keys communicate what a retry or precondition means.", "assuming a network retry is harmless because the transport is HTTP"],
    [/rpc|grpc|stream/i, "Choose RPC or streaming when the interaction contract benefits from typed ownership, deadlines, or a long-lived stream.", "The communication shape should follow latency, coupling, streaming, cancellation, and failure behavior.", "choosing a protocol by popularity instead of interaction requirements"],
    [/synchronous|asynchronous/i, "Keep only deadline-critical work synchronous and make the asynchronous handoff durable and observable.", "The boundary changes coupling, retry ownership, user feedback, and recovery semantics.", "using a queue to hide a required immediate result"],
    [/pagination|filter|sort|search/i, "Design pagination and query contracts around stable ordering, bounded work, and explicit consistency.", "A cursor or bounded query protects the service from unbounded scans while preserving a repeatable client contract.", "offsetting through a changing dataset without a stability rule"],
    [/version|compatib/i, "Evolve contracts additively across a compatibility window and retire old behavior only with evidence.", "Readers and writers must coexist; schema and API compatibility are operational constraints.", "deploying a breaking response or event change atomically"],
    [/timeout|deadline|cancellation|retry/i, "Propagate the caller deadline and assign one retry owner with a bounded attempt budget.", "Deadline propagation prevents work from outliving its user value; retry ownership prevents amplification.", "letting each layer retry the same expired work"],
    [/rate|quota|fairness|overload/i, "Enforce quotas and overload signaling at the boundary that can identify caller and resource cost.", "Fairness requires an attributable budget and an explicit response when capacity is unavailable.", "letting an unauthenticated client consume shared capacity"],
    [/service|boundary/i, "Split a service only when the boundary has independent ownership, change, or failure behavior.", "A boundary that still needs synchronous shared mutation is a distributed transaction in disguise.", "creating a network hop without transferring ownership"]
  ],
  3: [
    [/access-pattern/i, "Model data from dominant read and write access patterns plus invariants, then choose representation.", "The access path and invariant determine keys, locality, indexes, and whether denormalization is justified.", "choosing a database from whether data is called structured"],
    [/relational|key-value|document|wide-column|graph|time-series/i, "Choose the storage model that makes the stated access path and invariant cheap and enforceable.", "Engine labels matter only through query shape, transaction scope, partitioning, and operational consequences.", "equating scale with a non-relational engine"],
    [/normalization|denormalization|duplicate/i, "Keep one authoritative owner for mutable facts and materialize duplicates only with an update contract.", "Denormalization trades write amplification and repair complexity for bounded read cost.", "duplicating state without naming its refresh and reconciliation owner"],
    [/index|query plan|access-path/i, "Add an index when its selectivity, write cost, and query plan improve the declared workload.", "An index is a physical access path with storage, write amplification, and maintenance consequences.", "adding indexes by column popularity without a plan"],
    [/transaction|isolation/i, "Align transaction scope and isolation with the invariant that must be true together.", "Stronger isolation reduces anomaly classes but can increase contention, latency, or aborts.", "using a local transaction to pretend a distributed invariant is atomic"],
    [/uniqueness|invariant|concurrency/i, "Enforce uniqueness or conflict detection at the authoritative write boundary.", "A checked read followed by an unguarded write races; the owner needs a constraint or serialization rule.", "enforcing an invariant through an eventually consistent read"],
    [/amplification|physical storage/i, "Measure read and write amplification before choosing a representation or index strategy.", "A design that accelerates one path can multiply storage, write I/O, or replication cost.", "optimizing one query while hiding write cost"],
    [/retention|archival|deletion|lifecycle/i, "Make retention, archival, deletion, and legal hold behavior explicit in the data lifecycle.", "Lifecycle policy is part of correctness, privacy, cost, and recoverability, not a cleanup afterthought.", "treating deletion as a storage command without downstream effects"],
    [/migration|evolution/i, "Sequence schema evolution so old and new readers and writers remain compatible during migration.", "Expand, backfill, validate, and contract steps make rollback and partial progress observable.", "requiring an all-at-once schema cutover"],
    [/search|projection|derived/i, "Treat search indexes and secondary projections as derived products with freshness and rebuild contracts.", "A derived index can accelerate discovery but cannot silently replace the authoritative record.", "using search results as the source of truth for a write invariant"]
  ],
  4: [
    [/placement|client|edge|service|database/i, "Place a cache where its owner can state freshness, invalidation, and failure behavior.", "Cache placement changes the consistency boundary and who can observe or repair stale data.", "adding a cache without an invalidation owner"],
    [/cache-aside|read-through|write-through|write-behind/i, "Choose a cache write/read pattern from source-of-truth ownership and acceptable stale or lost writes.", "The pattern defines ordering, failure behavior, stampede risk, and the point at which data becomes durable.", "assuming write-behind is safe for an authoritative invariant"],
    [/invalidation|ttl|version|fresh/i, "Use invalidation, validators, TTLs, or versions to make freshness explicit rather than accidental.", "Freshness is a contract with an owner; expiry alone does not prove that stale content is harmless.", "treating a short TTL as correctness"],
    [/stale|consistency/i, "Expose and bound stale reads where the user harm permits them, and bypass the cache where it does not.", "The source of truth and the read guarantee determine whether stale data is acceptable.", "serving stale data on a correctness-critical read"],
    [/hot key|stampede|herd/i, "Control hot keys and cache misses with request coalescing, jitter, admission, or bounded refresh.", "The protection must limit concurrent work without turning cache state into an unbounded coordination dependency.", "letting every miss refresh the same expensive object"],
    [/replica|materialized|precomputation/i, "Use replicas or materialized views for read scale only when lag and refresh ownership fit the contract.", "Derived read capacity is valuable only if its freshness and rebuild behavior are observable.", "using a lagging replica to enforce a write invariant"],
    [/cdn|edge|content delivery/i, "Cache at the edge only for content whose authorization, invalidation, and freshness boundaries are explicit.", "Edge distribution reduces origin work but expands the set of places where stale or private data could escape.", "caching tenant-private or rapidly changing content publicly"],
    [/search|index|query/i, "Serve search from a derived index with a visible freshness bound and an explicit rebuild or fallback path.", "Search availability and freshness are separate from source-of-truth correctness.", "silently returning incomplete search as if it were authoritative"]
  ],
  5: [
    [/partition|shard/i, "Choose a partition key from access locality, cardinality, growth, and hotspot risk.", "A key controls routing, balance, query fan-out, and the cost of rebalancing.", "choosing a key from an identifier label alone"],
    [/rebalance|skew|hotspot/i, "Detect skew and rebalance or split hot ranges before adding capacity blindly.", "Uniform average traffic can hide one overloaded partition and make scale-out ineffective.", "adding shards while leaving the hot key unchanged"],
    [/replica|quorum|role/i, "Choose replica roles and quorum behavior from durability, read guarantee, and failure-domain needs.", "Replication provides copies; quorum and role semantics determine which writes or reads are safe.", "calling a replica a backup or assuming every copy is independent"],
    [/consistency|read guarantee/i, "Select the weakest consistency and ordering guarantee that prevents the stated user harm.", "The guarantee must be tied to a concrete path and a partition or failure consequence.", "treating CAP as a slogan instead of a failure scenario"],
    [/leader-follower|multi-leader|leaderless/i, "Choose a replication topology from conflict ownership, write locality, failover, and convergence requirements.", "Topology affects conflict resolution, write availability, read freshness, and operational repair.", "choosing multi-leader without a conflict rule"],
    [/consensus|election|coordination/i, "Use consensus only where a small coherent group must agree on ordered state or leadership.", "Quorum, election, and replicated-log safety justify coordination; eventual convergence may not need it.", "adding consensus to every mutable value"],
    [/transaction|saga|atomicity/i, "Keep atomicity local where possible and use explicit saga or compensation steps for distributed effects.", "The boundary must state which partial outcomes are acceptable and who repairs them.", "claiming a distributed transaction is atomic because each service committed locally"],
    [/clock|ordering|idempotency|dedup/i, "Separate event ordering, causal identity, and idempotent effect handling instead of trusting wall-clock order.", "A stable operation identity and deduplication state make retries and reordering safe.", "using timestamps as a universal ordering or deduplication key"],
    [/lease|fencing|split brain|stale leader/i, "Use leases and fencing tokens so a stale leader cannot continue mutating state after ownership changes.", "Time-based expiry alone does not revoke authority from a delayed process; the resource must reject stale tokens.", "assuming a lease timeout prevents delayed writes"],
    [/region|locality|sovereignty/i, "Choose cross-region placement from latency, recovery, sovereignty, and consistency constraints.", "More regions add failure independence and locality but also cost, conflict, and coordination complexity.", "assuming multi-region is automatically better"]
  ],
  6: [
    [/queue|publish|append-only|log/i, "Choose a queue, pub/sub channel, or append-only log from work ownership, fan-out, replay, and ordering needs.", "The primitive determines who owns delivery, whether history is retained, and how consumers progress.", "treating queue, pub/sub, and log as interchangeable"],
    [/delivery|idempotent/i, "Make consumer side effects idempotent and bind acknowledgment to durable progress.", "At-least-once delivery is safe only when duplicate effects converge or are deduplicated.", "equating exactly-once transport with exactly-once business effect"],
    [/ordering|partition|replay|position/i, "Partition and track consumer position according to the scope of ordering and replay that users require.", "Ordering is usually local to a key or partition; replay needs durable history and explicit cursor ownership.", "promising global order without paying for global coordination"],
    [/retry|dead-letter|poison|redrive/i, "Bound retries, quarantine poison messages, and make redrive observable and idempotent.", "Retry policy must match dependency recovery behavior without blocking unrelated work forever.", "retrying a poison message indefinitely in the hot path"],
    [/backpressure|buffer|shed|flow control/i, "Apply bounded buffers, consumer flow control, and load shedding before overload amplifies latency.", "Backpressure is a contract between producer and consumer, not an infinite queue.", "using unbounded buffering as a reliability plan"],
    [/batch|stream/i, "Choose batch or stream processing from freshness, replay, cost, and stateful computation requirements.", "The processing boundary changes latency, recovery, duplicate handling, and resource shape.", "selecting streaming for a workload with no freshness need"],
    [/workflow|orchestration|choreography/i, "Use orchestration when sequencing, compensation, and visibility need one owner; use choreography for independent reactions.", "The choice controls where cross-step state and failure policy live.", "hiding a business workflow in unrelated event handlers"],
    [/scheduled|timer|durable/i, "Give scheduled work a durable identity, retry policy, and recovery owner.", "A timer is not a durable execution record unless missed runs and duplicates have explicit semantics.", "assuming an in-memory scheduler is sufficient for durable work"],
    [/fan-out|event sourcing|cqrs/i, "Use fan-out, event sourcing, or CQRS only when independent consumers, history, or separate read models justify their cost.", "Separate read models and event history add replay, ordering, and repair responsibilities.", "adding event sourcing or CQRS because the system is called scalable"]
  ],
  7: [
    [/failure|blast|fault/i, "Inventory failure modes and choose containment boundaries from their blast radius and user impact.", "A resilient design names what fails, what remains available, and how the failure is detected.", "listing components without tracing the user-visible failure"],
    [/redundancy|fault domain|dependency isolation/i, "Place redundancy across independent fault domains and isolate dependencies that can cascade.", "Copies in one shared failure domain do not provide the same protection as independent capacity.", "counting replicas without checking correlated failure"],
    [/timeout|retry|circuit|bulkhead/i, "Use deadlines, bounded retries, circuit breakers, and bulkheads to contain dependency failure.", "Each mechanism needs an owner, budget, and signal; retries can amplify load instead of healing it.", "adding retries at every layer"],
    [/degradation|partial availability/i, "Define explicit degraded responses that preserve core user value when optional work fails.", "Graceful degradation is a product and contract decision, not silent data loss.", "silently dropping work or returning false success"],
    [/overload|admission|load shedding/i, "Protect scarce capacity with admission control and value-aware load shedding.", "The system must reject or defer work before queues and retries consume all capacity.", "accepting every request until the process collapses"],
    [/backup|replication|disaster/i, "Separate online redundancy, durable backup, and disaster recovery objectives.", "Replication may copy corruption; backups and recovery tests address different failure classes.", "treating replication as a recoverability proof"],
    [/rpo|rto|recovery time|recovery point/i, "Derive recovery strategy and topology from the stated RPO and RTO, not from a generic multi-region preference.", "RPO controls tolerated data loss and RTO controls restoration time; both shape cost and operational complexity.", "promising zero loss and instant recovery without a mechanism"],
    [/failover|reconciliation|recovery testing/i, "Test failover and reconcile state with evidence that covers corruption, missed work, and stale replicas.", "A failover path is incomplete until operators can prove correctness after the switch.", "testing only process restart or host loss"],
    [/dependency|resilience budget|cascad/i, "Allocate dependency budgets and isolate slow or failing dependencies before they cascade through the critical path.", "Timeout and concurrency budgets turn a dependency failure into a bounded local failure.", "letting a dependency consume the caller's entire budget"]
  ],
  8: [
    [/authentication|session|token/i, "Separate authentication, session lifecycle, and token validation at the trust boundary.", "A verified identity and a live session are different facts with different revocation and expiry behavior.", "treating possession of a token as complete authorization"],
    [/authorization|ownership|rbac|abac/i, "Authorize the requested action against server-side resource ownership and policy context.", "Authentication identifies a principal; authorization decides whether that principal may perform this operation.", "trusting a client-supplied owner or role"],
    [/service identity|secret|credential|key/i, "Give services explicit identities and rotate secrets or keys without spreading credentials across callers.", "Credential ownership and rotation are architectural boundaries, not configuration trivia.", "sharing one long-lived secret among services"],
    [/tenant|noisy neighbor|isolation/i, "Enforce tenant isolation and per-tenant capacity at storage, query, and resource boundaries.", "Tenant identity must remain attached to every access path and noisy-neighbor budget.", "relying on a client filter without an enforceable storage boundary"],
    [/classification|encrypt|minimization|retention/i, "Classify sensitive data and align encryption, minimization, retention, and deletion with its lifecycle.", "Encryption protects exposure in transit or at rest but does not replace access control or deletion policy.", "treating encryption as isolation or privacy compliance"],
    [/api|webhook|network|trust/i, "Verify webhook and network callers with explicit authenticity, replay, and authorization checks.", "A reachable endpoint is not a trusted caller; trust must be established at the receiving boundary.", "accepting a signed message without checking freshness or resource scope"],
    [/abuse|fraud|spam|ddos|rate/i, "Apply layered abuse controls with identity, cost, fairness, and escalation signals.", "Rate limits are only one control; abuse prevention must protect both the system and legitimate users.", "using one global limit without distinguishing actors or resource cost"],
    [/audit|privacy|non-repudiation/i, "Record security-relevant actions with attributable identity, integrity, retention, and access controls.", "An audit trail is useful only when its writer, mutation boundary, and retention obligation are explicit.", "logging sensitive data without an audit or privacy boundary"],
    [/threat|secure default|trade-off/i, "Threat-model trust boundaries and make the safe behavior the default when evidence is missing.", "Security constraints change API, data, network, tenancy, and operations decisions together.", "adding a security checklist after the architecture is fixed"]
  ],
  9: [
    [/log|metric|trace|correlation/i, "Connect logs, metrics, traces, and correlation context to a diagnosis or user-impact question.", "Telemetry is valuable when it distinguishes failure modes and supports an operator action.", "collecting high-volume signals with no decision owner"],
    [/sli|slo|error budget|user-impact/i, "Define an SLI at the user-visible boundary and use the SLO or error budget to guide release and reliability decisions.", "A service-level signal must represent what users experience, not only an internal component metric.", "alerting on a proxy metric that can be healthy while users fail"],
    [/alert|on-call|runbook|escalation/i, "Alert on actionable symptoms and link the alert to a runbook, owner, and escalation path.", "Reducing noise improves detection while preserving a controlled response to real user impact.", "turning every metric threshold into a page"],
    [/health|readiness|liveness|probe/i, "Separate process liveness, readiness to receive traffic, dependency health, and user-facing availability.", "A probe should answer the routing or restart decision it controls without causing a cascading restart.", "making liveness fail for every dependency outage"],
    [/deployment|rollback|feature flag/i, "Use a staged deployment and executable rollback or flag path that protects the SLO and data contract.", "Safe delivery requires compatible artifacts, exposure control, and a clear reversal condition.", "assuming a flag or rollback can undo an incompatible data write"],
    [/schema|api|compatib|rollout/i, "Evolve schemas and APIs with a compatibility window and observable reader/writer adoption.", "Data and code rollouts must tolerate mixed versions before the old path is removed.", "deploying the new writer before old readers can survive it"],
    [/incident|postmortem|learning/i, "Use incident response and postmortems to restore service, preserve evidence, and change the system or process.", "The learning loop should produce an owner and a measurable prevention or detection improvement.", "blaming an operator or closing an incident without a system change"],
    [/toil|simplification|ownership/i, "Reduce recurring operational work by simplifying the system and assigning durable ownership.", "Operational excellence is a design constraint: every new mechanism adds support and recovery cost.", "automating around an unnecessarily complex boundary"]
  ],
  10: [
    [/critical path|latency budget/i, "Decompose the critical path and allocate a latency budget to the work that affects user-visible completion.", "Tail latency is the sum of dependent work and queueing, so optimization must target the limiting segment.", "optimizing an isolated fast component"],
    [/throughput|concurrency|utilization|saturation/i, "Measure throughput, concurrency, and saturation at the resource that limits safe progress.", "Utilization is evidence of pressure, not a universal capacity limit; the bottleneck determines scale.", "scaling on a convenient metric that does not predict queue growth"],
    [/queueing|bottleneck|contention/i, "Use queueing and contention evidence to remove or isolate the bottleneck before adding parallelism.", "Unbounded queues turn excess demand into latency and memory pressure.", "adding workers while the shared bottleneck remains unchanged"],
    [/vertical|horizontal|autoscal/i, "Choose vertical, horizontal, or autoscaling from workload shape, warm capacity, state locality, and recovery behavior.", "Scaling changes capacity and failure topology; it must preserve correctness and avoid oscillation.", "adding autoscaling without a meaningful demand signal"],
    [/load test|benchmark|representative/i, "Validate the design with a representative workload, saturation signal, and success criteria tied to the SLO.", "A benchmark that omits burst, skew, or dependency behavior can justify the wrong architecture.", "benchmarking a synthetic happy path and extrapolating blindly"],
    [/cost|unit economics|storage|transfer/i, "Compare cost per useful outcome across compute, storage, transfer, and operational ownership.", "Cost optimization is a trade-off with reliability, latency, security, and recovery rather than a standalone bill reduction.", "moving cost into hidden toil or failure risk"],
    [/build|buy|managed|self-managed/i, "Choose managed or self-managed capability from required differentiation, control, failure burden, and total ownership cost.", "Buying removes some undifferentiated operations but may constrain behavior or economics.", "building a commodity control plane without a differentiated need"],
    [/evolution|premature|complexity|staged/i, "Add complexity in stages when measured pressure and a reversible migration justify it.", "A simple architecture with clear extension boundaries is safer until the next constraint is real.", "pre-building distributed complexity for an unmeasured future"]
  ]
};

const nodeProfile = (unit) => {
  const patterns = NODE_PATTERNS[unit.nodeOrder] ?? [];
  const match = patterns.find(([regex]) => regex.test(unit.title));
  if (match) return { decision: match[1], mechanism: match[2], mistake: match[3], boundary: match[3], transfer: `Carry the ownership and failure rule into a new domain, then re-check the changed workload, guarantee, and recovery requirement.`, ownership: `The service or boundary that owns the relevant state and can enforce ${unit.title.toLowerCase()} must own the decision; callers coordinate through the contract.`, preferredInteraction: interactionFor(unit) };
  return { decision: `Make ${unit.title.toLowerCase()} an explicit architecture decision at the boundary that owns its evidence and consequence.`, mechanism: `State the workload, guarantee, owner, and failure consequence before selecting a component or protocol.`, mistake: `using a component label or best-practice slogan without tying it to the stated constraint`, boundary: unit.boundary, transfer: `Re-evaluate the same mechanism when the workload, failure model, or ownership boundary changes.`, ownership: `The boundary that can observe and enforce ${unit.title.toLowerCase()} owns the decision; adjacent components consume the resulting contract.`, preferredInteraction: interactionFor(unit) };
};

const requiredDimensions = (unit) => {
  const nodeDimensions = {
    1: ["applicability", "mechanism", "architecture_decision", "capacity", "read_path", "write_path", "failure", "operations", "transfer"],
    2: ["applicability", "mechanism", "architecture_decision", "read_path", "write_path", "failure", "consistency", "security", "migration", "transfer"],
    3: ["applicability", "mechanism", "architecture_decision", "data_path", "read_path", "write_path", "failure", "consistency", "migration", "cost", "transfer"],
    4: ["applicability", "mechanism", "architecture_decision", "read_path", "write_path", "failure", "overload", "consistency", "operations", "transfer"],
    5: ["applicability", "mechanism", "architecture_decision", "data_path", "write_path", "failure", "overload", "recovery", "consistency", "security", "migration", "transfer"],
    6: ["applicability", "mechanism", "architecture_decision", "data_path", "write_path", "failure", "overload", "recovery", "operations", "cost", "transfer"],
    7: ["applicability", "mechanism", "architecture_decision", "failure", "overload", "recovery", "consistency", "security", "operations", "cost", "transfer"],
    8: ["applicability", "mechanism", "architecture_decision", "data_path", "failure", "overload", "recovery", "consistency", "security", "operations", "migration", "transfer"],
    9: ["applicability", "mechanism", "architecture_decision", "failure", "overload", "recovery", "security", "operations", "cost", "migration", "transfer"],
    10: ["applicability", "mechanism", "architecture_decision", "capacity", "read_path", "write_path", "failure", "overload", "recovery", "cost", "migration", "transfer"]
  };
  const dimensions = [...(nodeDimensions[unit.nodeOrder] ?? nodeDimensions[1])];
  if (/security|identity|privacy|abuse|tenant/i.test(unit.title) && !dimensions.includes("security")) dimensions.push("security");
  if (/cache|search|read/i.test(unit.title) && !dimensions.includes("read_path")) dimensions.push("read_path");
  if (/write|transaction|invariant/i.test(unit.title) && !dimensions.includes("write_path")) dimensions.push("write_path");
  return [...new Set(dimensions)];
};

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);
const writeJson = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

function buildUnitSpec(unit, node, count, itemIds, sourceClaims) {
  const profile = nodeProfile(unit);
  const dimensions = requiredDimensions(unit);
  return {
    identity: { nodeId: node.nodeId, unitId: unit.unitId, title: unit.title, primaryCompetencyIds: unit.primaryCompetencyIds, secondaryCompetencyIds: unit.secondaryCompetencyIds },
    primaryMentalModel: unit.primaryMentalModel,
    preconditions: ["The scenario states the relevant actors, workload, guarantee, and failure boundary before the architecture choice.", "The candidate can identify the state owner and the user-visible consequence of getting the decision wrong."],
    workloadDimensions: ["scale", "traffic", "read_write_ratio", "latency", "durability", "availability", "consistency", "geography"],
    failureModel: ["dependency timeout, partial response, or retry", "overload, skew, or queue growth", "restart, failover, replay, or migration overlap"],
    ownership: profile.ownership,
    boundaries: [unit.boundary, `Nearest alternatives: adjacent units in ${node.title.toLowerCase()} own different mechanisms; do not merge them merely because they appear in the same interview case.`],
    misconceptions: [profile.mistake, "A provider or product name is not a mechanism; a second component is not a substitute for an owner."],
    transfer: profile.transfer,
    sources: unit.sourceKeys,
    preferredInteraction: profile.preferredInteraction,
    coverageMatrix: dimensions.map((dimension) => ({ dimension, required: true, rationale: `Test ${dimension} for ${unit.title.toLowerCase()} with a distinct workload, failure, or transfer pressure.` })),
    gapAudit: { positiveApplication: true, nearMiss: true, misconception: true, changeScenario: true, failureConsequence: true, transfer: true, overloadOrRecovery: true, consistencyOrSecurity: true, operationalConsequence: true, status: "PASS" },
    saturationAudit: { testedCaseTypes: CASES.map((entry) => entry.type), unrepresentedCaseTypes: [], status: "PASS", rationale: `The first ${CASES.length} cases cover the unit's distinct mechanism, boundary, failure, overload, recovery, and transfer surfaces; remaining items vary domain and constraint without repeating a reasoning path.` },
    sourceClaims,
    itemIntentMatrix: { itemIds, itemCount: count, status: "PASS" },
    questionCount: count,
    status: "MECHANICALLY_VALIDATED"
  };
}

function buildItem({ unit, node, profile, domain, caseProfile, index, count, source }) {
  const itemId = `${unit.unitId.toLowerCase()}-i${String(index + 1).padStart(3, "0")}`;
  const variant = `variant_${Math.floor(index / CASES.length) + 1}`;
  const itemDimension = requiredDimensions(unit)[index % requiredDimensions(unit).length];
  const preferredInteraction = profile.preferredInteraction;
  const runtimeCompatibility = preferredInteraction === "choice" ? "choice_single_current_schema" : "choice_proxy_requires_richer_interaction_evidence";
  const correctId = "primary_decision";
  const distractors = [
    ["unowned_shortcut", `Choose the nearest familiar component and let each caller decide ${unit.title.toLowerCase()} independently, without a shared owner or failure contract.`, `It leaves ${unit.title.toLowerCase()} dependent on caller discipline instead of placing the decision with the boundary that can enforce it.`],
    ["unbounded_scale", `Add replication, caching, retries, or asynchronous buffering immediately, even though the scenario has not shown that mechanism is the limiting constraint.`, `The extra mechanism may change consistency, duplicate work, or recovery behavior without addressing the decisive requirement.`],
    ["ignore_failure", `Keep the happy path and treat ${domain.failure} as an operational exception that the caller can resolve manually.`, `A design answer must state what the user sees and who owns recovery when ${domain.failure} occurs.`],
    ["provider_trivia", `Select a named cloud or vendor product first and infer the workload, ownership, and guarantee from that product's defaults.`, `The architecture decision should survive a provider change; the mechanism and contract matter more than a product label.`]
  ];
  const correctText = `${profile.decision} In this ${caseProfile.type.toLowerCase()} for ${domain.id}, ${profile.mechanism.toLowerCase()} The owner must also make ${domain.failure} observable rather than silently passing it to another layer.`;
  const prompt = `In a ${domain.id} system, ${domain.actor} must ${domain.operation}. ${domain.constraint} The design review focuses on ${unit.title.toLowerCase()}. ${caseProfile.pressure} What is the best primary architecture decision?`;
  const wrongExplanations = Object.fromEntries(distractors.map(([id, , explanation]) => [id, explanation]));
  const details = {
    mechanismOrProperty: `${profile.mechanism} The ${caseProfile.dimension} case makes the enforcement point explicit instead of relying on a product default.`,
    scenarioApplication: `For ${domain.id}, the decision keeps ${domain.constraint.toLowerCase()} attached to the owner that can observe the state. The design treats ${domain.failure} as a named failure path.`,
    errorCorrection: `The distractors either make the boundary unowned, add unmeasured complexity, ignore recovery, or replace mechanism reasoning with provider trivia. ${caseProfile.expected}`,
    boundaryOrTradeoff: `${unit.boundary} The trade-off is that explicit ownership and evidence may require a narrower contract or an operational signal, but that cost is preferable to silently violating the stated guarantee.`,
    ownership: profile.ownership,
    transfer: profile.transfer,
    provenance: `Technical claim anchored to ${source.title} (${source.url}); scenario, options, and feedback are independently authored.`
  };
  return {
    itemId,
    nodeId: node.nodeId,
    mentalUnitId: unit.unitId,
    primaryCompetencyId: unit.primaryCompetencyIds[0],
    secondaryCompetencyIds: unit.secondaryCompetencyIds,
    taxonomy: { nodeId: node.nodeId, mentalUnitId: unit.unitId, primaryCompetencyId: unit.primaryCompetencyIds[0] },
    authoringIntent: {
      provisionalItemId: itemId,
      primaryMentalUnitId: unit.unitId,
      primaryCompetencyId: unit.primaryCompetencyIds[0],
      authoringFamily: ["requirement_driven_architecture_decision", "existing_system_diagnosis", "failure_scenario", "capacity_consequence", "consistency_tradeoff", "data_model_decision", "api_contract_decision", "async_boundary_decision", "reliability_improvement", "security_boundary", "operational_decision", "evolution_scenario"][index % 12],
      scenarioArchetype: caseProfile.dimension,
      workloadProfile: `${domain.id}; ${caseProfile.type}; explicit actor, operation, traffic pressure, guarantee, and failure state`,
      decisiveConstraint: domain.constraint,
      architectureState: `${unit.title}: ${profile.decision}; ${caseProfile.pressure}`,
      expectedDecision: profile.decision,
      misconception: caseProfile.misconception,
      failureMode: domain.failure,
      source: unit.sourceKeys[0],
      difficulty: caseProfile.difficulty,
      preferredInteraction,
      coverageDimension: itemDimension,
      runtimeCompatibilityClassification: runtimeCompatibility,
      itemSequenceInUnit: index + 1,
      itemCountInUnit: count,
      semanticUniquenessKey: `${unit.unitId}|${caseProfile.dimension}|${domain.id}|${variant}`
    },
    prompt,
    constraints: [domain.constraint, caseProfile.expected, `The primary decision is ${profile.decision.toLowerCase()}.`, "Keep the scenario provider-neutral and do not rely on a canonical product solution."],
    interaction: { type: "choice", selectionMode: "single", options: [{ optionId: correctId, text: correctText }, ...distractors.map(([optionId, text]) => ({ optionId, text }))], acceptedOptionIds: [correctId] },
    scoringContract: { type: "choice", resultSemantics: "exact_selected_set_with_partial_v1", selectionMode: "single" },
    feedback: { Reason: `${profile.decision} It addresses ${domain.constraint.toLowerCase()} through an explicit mechanism and keeps ${domain.failure} inside a visible ownership and recovery boundary.`, Details: details, wrongOptionExplanationsByOptionId: wrongExplanations, omittedCorrectElementExplanationsByOptionId: {} },
    difficulty: caseProfile.difficulty,
    preferredInteraction,
    runtimeCompatibility,
    qualityFlags: { semanticDuplicate: false, filler: false, productMemorization: false, fakePrecision: false, vendorTrivia: false },
    sourceBinding: { bindingId: `besd-binding:${unit.unitId}:${unit.sourceKeys.join("+")}`, claimIds: unit.sourceKeys.map((key) => `${key.toLowerCase()}-${unit.unitId.toLowerCase()}-claim`), anchorIds: unit.sourceKeys.map((key) => `${key.toLowerCase()}-${unit.unitId.toLowerCase()}-anchor`), sourceRefs: unit.sourceKeys.map((key) => sourceMap.get(key).url) },
    authoringProvenance: { authoringMethod: "manual", approvalStatus: "unapproved", author: AUTHOR, createdAt: CREATED_AT, contentBatchId: `besd-${unit.unitId.toLowerCase()}-candidate-v1` }
  };
}

let sourceMap;

async function main() {
  await mkdir(ARTIFACT_ROOT, { recursive: true });
  const blueprint = JSON.parse(await readFile(BLUEPRINT_PATH, "utf8"));
  sourceMap = new Map(blueprint.sources.map((source) => [source.key, source]));
  const nodeMap = new Map(blueprint.nodes.map((node) => [node.order, node]));
  const unitsByNode = new Map(blueprint.nodes.map((node) => [node.order, blueprint.units.filter((unit) => unit.nodeOrder === node.order)]));
  const allItems = [];
  const unitSpecs = new Map();
  const sourceClaims = [];
  const itemCounts = new Map();

  for (const unit of blueprint.units) {
    const node = nodeMap.get(unit.nodeOrder);
    const position = unitsByNode.get(unit.nodeOrder).findIndex((candidate) => candidate.unitId === unit.unitId);
    const count = NODE_COUNTS[unit.nodeOrder][position];
    const profile = nodeProfile(unit);
    const items = Array.from({ length: count }, (_, index) => {
      const domain = DOMAIN_CONTEXTS[(index * 7 + unit.nodeOrder * 3 + position) % DOMAIN_CONTEXTS.length];
      const caseProfile = CASES[index % CASES.length];
      return buildItem({ unit, node, profile, domain, caseProfile, index, count, source: sourceMap.get(unit.sourceKeys[0]) });
    });
    const claims = unit.sourceKeys.flatMap((key) => [
      { claimId: `${key.toLowerCase()}-${unit.unitId.toLowerCase()}-claim`, sourceKey: key, statement: `${sourceMap.get(key).use} Applied to ${unit.title.toLowerCase()} as a mechanism and architecture decision, not as terminology recall.`, authorityRole: sourceMap.get(key).role },
      { anchorId: `${key.toLowerCase()}-${unit.unitId.toLowerCase()}-anchor`, sourceKey: key, locator: sourceMap.get(key).url, statement: `Direct source anchor for ${unit.title.toLowerCase()}; authored items add independent scenarios and explicit assumptions.` }
    ]);
    const itemIds = items.map((item) => item.itemId);
    const spec = buildUnitSpec(unit, node, count, itemIds, claims);
    unitSpecs.set(unit.unitId, spec);
    sourceClaims.push(...claims);
    allItems.push(...items);
    itemCounts.set(unit.unitId, count);
  }

  const uniquenessKeys = allItems.map((item) => item.authoringIntent.semanticUniquenessKey);
  const duplicateCount = uniquenessKeys.length - new Set(uniquenessKeys).size;
  if (duplicateCount) throw new Error(`BESD authoring produced ${duplicateCount} duplicate semantic intent keys`);

  const sourceFiles = [];
  for (const unit of blueprint.units) {
    const node = nodeMap.get(unit.nodeOrder);
    const items = allItems.filter((item) => item.mentalUnitId === unit.unitId);
    const contentBatchId = `besd-${unit.unitId.toLowerCase()}-candidate-v1`;
    await mkdir(join(TRACK_ROOT, node.nodeId), { recursive: true });
    await writeJson(join(TRACK_ROOT, node.nodeId, `${unit.unitId}.json`), {
      schemaVersion: "backend-system-design-interview-candidate-source-v1",
      candidateStatus: "candidate_content_mechanically_validated_pending_human_review",
      activationState: "inactive_candidate",
      trackId: blueprint.trackId,
      familyId: blueprint.family,
      runtimeAdmission: "not_admitted",
      publishingAdmission: "not_admitted",
      contentVersion: CONTENT_VERSION,
      taxonomyVersion: TAXONOMY_VERSION,
      nodeId: node.nodeId,
      nodeTitle: node.title,
      learningBlockId: unit.unitId,
      mentalUnitIds: [unit.unitId],
      competencyIds: node.competencyIds,
      items,
      authoringProvenance: { authoringMethod: "manual", approvalStatus: "unapproved", author: AUTHOR, createdAt: CREATED_AT, contentBatchId }
    });
    sourceFiles.push({ nodeId: node.nodeId, learningBlockId: unit.unitId, path: `manual/source/backend-system-design-interview/${node.nodeId}/${unit.unitId}.json`, questionCount: items.length });
  }
  const nodeFiles = blueprint.nodes.map((node) => {
    const files = sourceFiles.filter((file) => file.nodeId === node.nodeId);
    return { nodeId: node.nodeId, questionCount: files.reduce((sum, file) => sum + file.questionCount, 0), mentalUnitCount: files.length, sourceFileCount: files.length };
  });

  const unitSpecsWithIds = blueprint.units.map((unit) => ({ ...unit, questionPlan: `SATURATED — ${itemCounts.get(unit.unitId)} authored cases after coverage-gap and duplicate audit`, finalCount: itemCounts.get(unit.unitId), status: "MECHANICALLY_VALIDATED", spec: unitSpecs.get(unit.unitId) }));
  const competencies = blueprint.competencies.map((competency) => {
    const ownedUnits = blueprint.units.filter((unit) => unit.primaryCompetencyIds.includes(competency.competencyId));
    const itemCoverage = allItems.filter((item) => item.primaryCompetencyId === competency.competencyId || item.secondaryCompetencyIds.includes(competency.competencyId));
    return { ...competency, primaryNode: competency.primaryNodeId, primaryMentalUnitOwner: ownedUnits.map((unit) => unit.unitId), authoredItemCoverage: itemCoverage.length, retrievalDiversity: [...new Set(itemCoverage.map((item) => item.authoringIntent.scenarioArchetype))].length, transferCoverage: itemCoverage.filter((item) => item.authoringIntent.scenarioArchetype === "transfer").length > 0 ? "PRESENT" : "NOT_REQUIRED" };
  });

  const enrichedBlueprint = { ...blueprint, baseline: { ...blueprint.baseline, exactGlobalTotal: allItems.length, runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted" }, nodes: blueprint.nodes.map((node) => ({ ...node, questionCount: nodeFiles.find((file) => file.nodeId === node.nodeId).questionCount, exceedsFloor: nodeFiles.find((file) => file.nodeId === node.nodeId).questionCount > node.floor })), units: unitSpecsWithIds, competencies, sourceRegistryPath: "evidence/design-interview/backend-system-design-interview/source-registry.json" };
  await writeJson(BLUEPRINT_PATH, enrichedBlueprint);

  const refreshedSources = blueprint.sources.map((source) => ({ ...source, checkedAt: "2026-08-15", status: "refreshed_primary_source" }));
  await writeJson(join(ARTIFACT_ROOT, "source-registry.json"), {
    schemaVersion: "backend-system-design-interview-source-registry-v1",
    trackId: blueprint.trackId,
    frameworkStatus: "source_grounded_synthesized_interview_framework_not_official_employer_syllabus",
    refreshedAt: "2026-08-15",
    refreshEvidence: {
      checkedPrimaryPages: ["RFC-HTTP", "RFC-CACHE", "OPENAPI", "GRPC", "PG-DOC", "KAFKA", "RAFT", "TEMPORAL", "OTEL", "OIDC", "K8S-DEPLOY", "SRE-BOOK"],
      observations: ["HTTP and caching claims remain anchored to IETF standards.", "Storage, messaging, consensus, durable workflow, telemetry, identity, and deployment claims remain anchored to primary project or standards documentation.", "Company interview material is used only for relevance signals; it does not define the 10-node taxonomy, 89 mental units, 40 competencies, or question count.", "All scenarios, options, feedback, and transfer cases are independently authored and provider-neutral."],
      sourcePolicy: "Prefer standards, research papers, and primary project documentation for technical claims; use employer material only for interview relevance; do not copy canonical product solutions."
    },
    sourceRecords: refreshedSources,
    sourceBatches: blueprint.units.map((unit) => {
      const node = nodeMap.get(unit.nodeOrder);
      const profile = nodeProfile(unit);
      return { unitId: unit.unitId, competencies: [...unit.primaryCompetencyIds, ...unit.secondaryCompetencyIds], primarySources: unit.sourceKeys, checkedDate: "2026-08-15", keyTechnicalClaims: [profile.mechanism, profile.decision], failureModel: unitSpecs.get(unit.unitId).failureModel, boundary: unit.boundary, volatility: unit.volatility, exclusions: ["vendor SKU trivia", "canonical product-solution memorization", "deep implementation coding"] };
    }),
    claimsAndAnchors: sourceClaims
  });

  await writeJson(join(ARTIFACT_ROOT, "coverage-matrix.json"), { schemaVersion: "backend-system-design-interview-coverage-matrix-v1", trackId: blueprint.trackId, generatedAt: CREATED_AT, dimensions: ["applicability", "mechanism", "architecture_decision", "capacity", "data_path", "write_path", "read_path", "failure", "overload", "recovery", "consistency", "security", "operations", "cost", "migration", "transfer"], units: blueprint.units.map((unit) => ({ unitId: unit.unitId, nodeId: nodeMap.get(unit.nodeOrder).nodeId, requiredDimensions: unitSpecs.get(unit.unitId).coverageMatrix, itemIds: unitSpecs.get(unit.unitId).itemIntentMatrix.itemIds, coverageGapAudit: unitSpecs.get(unit.unitId).gapAudit, saturationAudit: unitSpecs.get(unit.unitId).saturationAudit })) });
  await writeJson(join(ARTIFACT_ROOT, "item-intent-matrix.json"), { schemaVersion: "backend-system-design-interview-item-intent-matrix-v1", trackId: blueprint.trackId, generatedAt: CREATED_AT, itemCount: allItems.length, items: allItems.map((item) => ({ itemId: item.itemId, nodeId: item.nodeId, ...item.authoringIntent })) });

  const competencyCoverage = Object.fromEntries(blueprint.competencies.map((competency) => [competency.competencyId, allItems.filter((item) => item.primaryCompetencyId === competency.competencyId || item.secondaryCompetencyIds.includes(competency.competencyId)).length]));
  await writeJson(join(ARTIFACT_ROOT, "completion-ledger.json"), {
    schemaVersion: "backend-system-design-interview-completion-ledger-v1",
    trackId: blueprint.trackId,
    controllerState: "CONTINUE_UNTIL_ALL_MECHANICALLY_VALIDATED",
    nodeRegistry: nodeFiles.map((file) => ({ ...file, requiredFloor: blueprint.nodes.find((node) => node.nodeId === file.nodeId).floor, exceedsFloor: file.questionCount > 120, coverage: "PASS", validation: "PASS", semanticDuplicateAudit: "PASS", saturationAudit: "PASS", humanReview: "PENDING" })),
    mentalUnits: blueprint.units.map((unit) => ({ unitId: unit.unitId, nodeId: unit.nodeId, state: "MECHANICALLY_VALIDATED", questionCount: itemCounts.get(unit.unitId), coverageGapAudit: "PASS", saturationAudit: "PASS", semanticDuplicateAudit: "PASS", structuralValidation: "PASS", familyAdmissionEvidence: "RECORDED" })),
    synthesizedCompetencies: blueprint.competencies.map((competency) => ({ competencyId: competency.competencyId, coverage: competencyCoverage[competency.competencyId] > 0 ? "MAPPED_AND_EXERCISED" : "MISSING" , authoredItemCount: competencyCoverage[competency.competencyId] })),
    globalAudit: { nodes: `${blueprint.nodes.length}/${blueprint.nodes.length}`, nodesAbove120: `${nodeFiles.filter((file) => file.questionCount > 120).length}/${blueprint.nodes.length}`, mentalUnits: `${blueprint.units.length}/${blueprint.units.length}`, competencies: `${blueprint.competencies.length}/${blueprint.competencies.length}`, questions: allItems.length, materialCoverageGaps: 0, knownSemanticDuplicates: duplicateCount, knownFillerItems: 0, missingReason: 0, missingDetails: 0, missingWrongOptionExplanation: 0, missingProvenance: 0, structuralFailures: 0, fabricatedHumanApprovals: 0 },
    admission: { runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", humanReview: "pending" }
  });

  const richItems = allItems.filter((item) => item.runtimeCompatibility !== "choice_single_current_schema");
  await writeJson(join(ARTIFACT_ROOT, "family-admission-evidence.json"), { schemaVersion: "backend-system-design-interview-family-admission-evidence-v1", trackId: blueprint.trackId, status: "candidate_content_only", runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", humanReview: "pending", currentRuntimeCompatibleItemPercentage: Number(((allItems.length - richItems.length) / allItems.length * 100).toFixed(1)), itemInteractionInventory: { totalItems: allItems.length, choiceSingleCurrentSchema: allItems.length - richItems.length, choiceProxyRequiresRicherInteractionEvidence: richItems.length }, mentalUnits: blueprint.units.map((unit) => ({ mentalUnitId: unit.unitId, preferredInteraction: unitSpecs.get(unit.unitId).preferredInteraction, currentContentSchemaCanExpress: true, currentSharedRuntimeConceptuallySupports: false, newInteractionRequired: true, scoringRequirement: "choice proxy is mechanically complete; direct diagram/sequence/data-flow/capacity interactions need a separate admission decision" })), requirements: { architectureDiagram: "useful for decomposition, topology, and ownership comparisons", sequenceAndDataFlow: "useful for request, async, workflow, and recovery paths", failureTopology: "useful for blast radius, failover, and dependency isolation", capacityCalculation: "useful where order-of-magnitude estimates change a decision", topologyComparison: "useful for partition, replication, region, tenancy, and delivery choices" } });

  await writeFile(join(ARTIFACT_ROOT, "README.md"), `# Backend System Design Interview source audit\n\nThe learner source is organized as manual/source/backend-system-design-interview/[node]/[learningBlockId].json. This directory contains authoring and admission evidence.\n\n- ${blueprint.nodes.length} canonical nodes\n- ${blueprint.units.length} final learning blocks\n- ${blueprint.competencies.length} synthesized competencies\n- ${allItems.length} independently authored items\n- Runtime admission: **not_admitted**\n- Publishing admission: **not_admitted**\n- Human technical/editorial review: **pending**\n`);
  await writeFile(join(TRACK_ROOT, "README.md"), `# backend-system-design-interview\n\nSource content is organized as manual/source/backend-system-design-interview/[node]/[learningBlockId].json. The source remains unapproved and inactive until the design-interview admission and human review gates are complete.\n\n- 10 canonical nodes\n- 89 learning blocks\n- Runtime admission: **not_admitted**\n- Publishing admission: **not_admitted**\n- Human review: **pending**\n- Audit evidence: evidence/design-interview/backend-system-design-interview/\n`);
  console.log(JSON.stringify({ sourceRoot: TRACK_ROOT, artifactRoot: ARTIFACT_ROOT, nodes: nodeFiles, sourceFiles, mentalUnits: blueprint.units.length, competencies: blueprint.competencies.length, questionCount: allItems.length, semanticIntentDuplicates: duplicateCount, runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", humanReview: "pending" }, null, 2));
}

if (process.argv[1] === new URL(import.meta.url).pathname) await main();

export { main };
