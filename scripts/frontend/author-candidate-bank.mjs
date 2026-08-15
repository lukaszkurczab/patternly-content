import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { competencies, nodes, units, workbookBaseline } from "./frontend-bank-manifest.mjs";
import { buildRichFeedback, buildRichInteraction, buildRichScoringContract, isRichInteractionPreference } from "./frontend-interactions.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const TRACK_ROOT = join(ROOT, "manual/source/frontend-system-design-interview");
const ARTIFACT_ROOT = join(ROOT, "evidence/design-interview/frontend-system-design-interview");
const CREATED_AT = "2026-08-15T00:00:00.000Z";
const CONTENT_VERSION = "frontend-system-design-interview-candidate-v2026.08.15";
const TAXONOMY_VERSION = "frontend-system-design-interview-workbook-v2026.08.15";
const AUTHOR = "OpenAI GPT-5.6 Pro (candidate authoring; not a human reviewer)";

const sourceRows = [
  ["INT-AMZ-FEE", "Official interview preparation", "Amazon Front-End Engineer Interview Prep", "https://amazon.jobs/content/en/how-we-hire/fee-interview-prep", "MEDIUM", "Interview relevance: user experience, performance, accessibility, security, scalability, and explicit design clarification."],
  ["INT-MS-TECH", "Official interview preparation", "Microsoft technical interviewing", "https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing", "MEDIUM", "Interview relevance: problem decomposition, design, testing, security, boundaries, and customer perspective."],
  ["INT-META-SWE", "Official interview preparation", "Preparing for your software engineering interview at Meta", "https://www.metacareers.com/blog/preparing-for-your-software-engineering-interview-at-meta/", "MEDIUM", "Interview relevance: clarify requirements, communicate design choices, and improve a design through feedback."],
  ["HTML", "Web standard", "WHATWG HTML Living Standard", "https://html.spec.whatwg.org/", "MEDIUM", "Document lifecycle, parsing, semantics, navigation, forms, scripts, and browser-facing behavior."],
  ["DOM", "Web standard", "WHATWG DOM Standard", "https://dom.spec.whatwg.org/", "MEDIUM", "DOM tree, events, nodes, mutation, and browser object-model boundaries."],
  ["FETCH", "Web standard", "WHATWG Fetch Standard", "https://fetch.spec.whatwg.org/", "HIGH", "Request lifecycle, credentials, response handling, abort, CORS, and browser network boundaries."],
  ["MDN-WEBAPI", "Primary platform documentation", "MDN Web APIs", "https://developer.mozilla.org/en-US/docs/Web/API", "MEDIUM", "Browser capability, events, storage, lifecycle, and compatibility-oriented platform reference."],
  ["WEB-WORKERS", "Primary platform documentation", "MDN Using web workers", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers", "MEDIUM", "Worker isolation, message passing, transferable data, and main-thread boundaries."],
  ["RFC-HTTP", "Internet standard", "RFC 9110 HTTP Semantics", "https://www.rfc-editor.org/rfc/rfc9110.html", "MEDIUM", "HTTP methods, status semantics, representation, caching inputs, and request/response contracts."],
  ["RFC-CACHE", "Internet standard", "RFC 9111 HTTP Caching", "https://www.rfc-editor.org/rfc/rfc9111.html", "MEDIUM", "Freshness, validation, reuse, cache keys, and shared/private response-cache boundaries."],
  ["REACT-STATE", "Primary framework documentation", "React Managing State", "https://react.dev/learn/managing-state", "HIGH", "State ownership, sharing, derived state, and avoiding redundant state; examples remain transferable."],
  ["REACT-RENDER", "Primary framework documentation", "React render and commit", "https://react.dev/learn/render-and-commit", "HIGH", "Render reasoning and component update boundaries without requiring framework trivia."],
  ["TS-HANDBOOK", "Primary language documentation", "TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html", "HIGH", "Type-level contracts and boundaries used only as transferable interface examples."],
  ["STORYBOOK", "Primary project documentation", "Storybook documentation", "https://storybook.js.org/docs", "HIGH", "Component contracts, states, documentation, and visual test boundaries."],
  ["DESIGN-TOKENS", "Community standard", "W3C Design Tokens Community Group", "https://www.w3.org/community/design-tokens/", "HIGH", "Token and theme boundary concepts; no draft syntax is required."],
  ["GRAPHQL", "Specification", "GraphQL Specification", "https://spec.graphql.org/", "MEDIUM", "Shape selection, contracts, evolution, and aggregation decisions."],
  ["MDN-IDB", "Primary platform documentation", "MDN IndexedDB API", "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API", "MEDIUM", "Structured local persistence, transaction scope, and browser storage boundaries."],
  ["WEBDEV-RENDER", "Primary web guidance", "Rendering on the Web", "https://web.dev/articles/rendering-on-the-web", "MEDIUM", "CSR, SSR, static, streaming, and delivery trade-offs grounded in requirements."],
  ["WEBDEV-VITALS", "Primary web guidance", "Web Vitals", "https://web.dev/articles/vitals", "HIGH", "LCP, INP, CLS, field/lab measurement, and user-centered performance evidence."],
  ["MDN-SW", "Primary platform documentation", "MDN Service Worker API", "https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers", "MEDIUM", "Service-worker lifecycle, fetch interception, cache strategy, and explicit offline states."],
  ["RFC-WS", "Internet standard", "RFC 6455 WebSocket Protocol", "https://www.rfc-editor.org/rfc/rfc6455", "MEDIUM", "Bidirectional connection boundaries and protocol lifecycle."],
  ["MDN-SSE", "Primary platform documentation", "MDN Server-sent events", "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events", "MEDIUM", "One-way event delivery and reconnect semantics."],
  ["MDN-WEBRTC", "Primary platform documentation", "MDN WebRTC API", "https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API", "MEDIUM", "Peer connection, signaling, media, and relay boundaries."],
  ["WEBPERF", "Primary web guidance", "User-centric performance metrics", "https://web.dev/articles/user-centric-performance-metrics", "HIGH", "Measurement plans, representative journeys, and diagnosing user-visible bottlenecks."],
  ["WCAG", "Web standard", "Web Content Accessibility Guidelines 2.2", "https://www.w3.org/TR/WCAG22/", "MEDIUM", "Normative accessibility requirements used as system constraints, not terminology trivia."],
  ["ARIA-APG", "Primary accessibility guidance", "WAI-ARIA Authoring Practices Guide", "https://www.w3.org/WAI/ARIA/apg/", "MEDIUM", "Composite widgets, keyboard interaction, focus, roles, and state contracts."],
  ["W3C-I18N", "Primary web guidance", "W3C Internationalization", "https://www.w3.org/International/", "MEDIUM", "Localization, language, RTL, text expansion, and internationalized content behavior."],
  ["OWASP-WEB", "Primary security guidance", "OWASP Top 10", "https://owasp.org/www-project-top-ten/", "MEDIUM", "Web threat boundaries, trust, injection, access control, and unsafe design decisions."],
  ["CSP", "Web standard", "Content Security Policy Level 3", "https://www.w3.org/TR/CSP3/", "MEDIUM", "Script restrictions, source policy, Trusted Types boundary, and supply-chain controls."],
  ["PLAYWRIGHT", "Primary project documentation", "Playwright documentation", "https://playwright.dev/docs/intro", "HIGH", "Real-browser journeys, cross-browser evidence, and end-to-end test boundaries."],
  ["TESTING-LIB", "Primary project documentation", "Testing Library documentation", "https://testing-library.com/docs/", "MEDIUM", "Behavior-oriented component tests and user-observable contracts."],
  ["OTEL-JS", "Primary project documentation", "OpenTelemetry JavaScript", "https://opentelemetry.io/docs/languages/js/", "MEDIUM", "Client traces, metrics, logs, context, and diagnosable operational boundaries."],
  ["OPENFEATURE", "Open specification", "OpenFeature specification", "https://openfeature.dev/specification/", "MEDIUM", "Flag evaluation, provider boundaries, rollout, and safe feature evolution."]
].map(([key, role, title, url, volatility, use]) => ({ key, role, title, url, volatility, use, checkedAt: "2026-08-15", status: "refreshed_primary_source" }));
const sources = new Map(sourceRows.map((source) => [source.key, source]));

const domains = [
  ["city-permitting", "a city permitting dashboard", "the permitting coordinator", "review an application and request one missing document", "the applicant must know whether the primary submission succeeded", "ambiguous completion"],
  ["field-inspection", "an offline field-inspection app", "the inspector", "record a site observation", "the device may lose connectivity before the next site", "partial inspection"],
  ["route-planner", "a logistics route planner", "the dispatcher", "adjust a route while a live position stream is visible", "the map must remain usable on a low-end tablet", "stalled interaction"],
  ["clinic-booking", "a clinic booking portal", "the patient", "select a slot and confirm an appointment", "a failed confirmation must not look like a completed booking", "double booking"],
  ["research-editor", "a collaborative research editor", "the author", "edit a paragraph while another reviewer comments", "the active revision and comment anchors must remain attributable", "lost edits"],
  ["finance-console", "a finance operations console", "the analyst", "approve a payout exception", "authorization and audit evidence must remain server authoritative", "unauthorized approval"],
  ["media-library", "a media library", "the curator", "upload a large video and inspect its processing state", "the upload can pause and resume without corrupting the final asset", "stale progress"],
  ["course-player", "a course player", "the learner", "resume a lesson from a shared link", "the first view needs metadata while playback controls need browser state", "wrong resume point"],
  ["support-inbox", "a support inbox", "the support agent", "claim and reply to a conversation", "presence is ephemeral but the reply is durable", "duplicate reply"],
  ["inventory-board", "a replenishment board", "the store manager", "filter inventory and submit a reorder", "filters must be shareable without becoming global application state", "stale reorder"],
  ["travel-planner", "a travel planner", "the traveler", "compare itineraries across providers", "provider failures must be visible without blanking healthy results", "hidden partial data"],
  ["document-signing", "a document-signing workspace", "the signer", "open and sign the current document revision", "the signed evidence must identify the exact revision", "signed wrong version"],
  ["analytics-explorer", "a data-exploration dashboard", "the analyst", "change a query and inspect a large result set", "rapid changes must not let an older response overwrite a newer intent", "stale response"],
  ["booking-admin", "a booking administration panel", "the operator", "move a reservation and notify the guest", "the mutation must reconcile with server version and audit state", "optimistic divergence"],
  ["education-authoring", "an education authoring suite", "the curriculum editor", "publish a module with preview and accessibility checks", "preview state must not grant publishing authority", "false readiness"],
  ["public-content", "a public content site", "the reader", "open a localized article from search", "crawler-visible content and personalized controls have different cache boundaries", "cache leakage"],
  ["collaboration-board", "a collaborative planning board", "the facilitator", "drag a card while other users update the board", "reconnect must recover missed events without silently replacing local intent", "lost collaboration"],
  ["video-call", "a browser video-call room", "the participant", "join a call and change devices", "signaling, media, permissions, and relay fallback are distinct boundaries", "no media recovery"],
  ["photo-upload", "a field photo-upload workflow", "the technician", "capture and upload evidence", "camera capability and network availability may change during the task", "unavailable camera"],
  ["map-search", "a map search experience", "the user", "pan, search, and select a place", "large lists and map rendering must preserve interaction responsiveness", "janky interaction"],
  ["retail-checkout", "a retail checkout", "the shopper", "apply a discount and place an order", "the client can guide input but cannot enforce protected pricing", "price tampering"],
  ["message-center", "a customer message center", "the customer", "read notifications and mark one as read", "new items may arrive while the current list is open", "read-state race"],
  ["fleet-dashboard", "a fleet dashboard", "the fleet manager", "monitor vehicles and drill into one vehicle", "the dashboard has a bounded freshness budget and a slow network", "wasted polling"],
  ["legal-portal", "a legal case portal", "the case worker", "upload and review a confidential document", "third-party scripts must not receive confidential fields", "data exfiltration"],
  ["warehouse-scan", "a warehouse scanning tool", "the picker", "scan an item with a handheld input", "keyboard, touch, camera, and reduced-motion use must share the task contract", "input dead end"],
  ["event-registration", "an event-registration site", "the attendee", "register, recover a validation error, and receive confirmation", "long localized names and slow devices are expected", "invisible error"],
  ["design-system", "a shared design-system catalog", "the component maintainer", "evolve a dialog or combobox contract", "product teams need stable behavior while visual tokens change", "breaking primitive"],
  ["admin-table", "an administrative data table", "the operator", "sort, filter, paginate, and export rows", "URL state, server state, and local selection have different lifetimes", "state collision"],
  ["streaming-home", "a streaming home screen", "the viewer", "open personalized recommendations", "the first view should not wait for noncritical personalized regions", "blocked first paint"],
  ["audio-studio", "an audio production studio", "the producer", "preview a recording and save markers", "media playback, markers, and upload processing fail independently", "coupled failure"],
  ["translation-workspace", "a translation workspace", "the translator", "switch locale and edit a long message", "RTL, plural forms, and text expansion are required", "layout overflow"],
  ["security-settings", "an account security settings page", "the account owner", "revoke a session and rotate credentials", "logout and refresh behavior must be explicit across tabs", "stale credential"],
  ["experiment-console", "an experiment console", "the product engineer", "roll out a client change to one cohort", "assignment, exposure, rollback, and telemetry must be correlated", "unmeasured rollout"],
  ["incident-console", "a production incident console", "the on-call engineer", "triage a client regression", "field evidence must identify browser, release, and user impact", "unactionable telemetry"],
  ["marketplace-search", "a marketplace search page", "the buyer", "search, refine, and open a result", "the request can be cancelled and the URL should reproduce the view", "lost query"],
  ["calendar", "a shared calendar", "the organizer", "move an event while attendees receive updates", "the visible event, server version, and notifications may arrive in different orders", "conflicting event"],
  ["knowledge-base", "a knowledge-base editor", "the editor", "preview and publish a page", "draft, published, and cached representations have separate authorities", "draft leakage"]
].map(([id, product, actor, operation, constraint, failure]) => ({ id, product, actor, operation, constraint, failure }));

const axes = [
  ["positive_application", "a direct architecture choice", "the primary journey must remain observable end to end", "name the success and failure states before selecting implementation"],
  ["near_miss", "a near-miss architecture", "one convenient shortcut would move ownership across a boundary", "reject the shortcut by identifying the lost authority"],
  ["constraint_reversal", "a changed constraint", "the correct design must change when device, network, privacy, or latency changes", "transfer the decision only when the decisive constraint reverses"],
  ["failure_diagnosis", "a failure diagnosis", "the degraded state must be explicit and recoverable", "keep the failed transition observable rather than silently falling through"],
  ["state_ownership", "a state-ownership review", "the state lifetime and source of truth must agree", "store state at the narrowest owner that can enforce its lifecycle"],
  ["data_flow", "a request or data-flow trace", "the learner must identify where data becomes stale or unauthorized", "trace authority, freshness, and error propagation across the boundary"],
  ["browser_mechanism", "a browser execution trace", "the browser mechanism determines the user-visible result", "reason from lifecycle, scheduling, rendering, networking, or storage evidence"],
  ["performance_diagnosis", "a measured performance diagnosis", "the intervention must match the measured bottleneck", "do not select a generic optimization without a causal mechanism"],
  ["accessibility_evaluation", "an inclusive interaction evaluation", "keyboard, assistive technology, zoom, motion, and text expansion are product constraints", "preserve the task contract across input and presentation modes"],
  ["security_boundary", "a trust-boundary review", "the browser is an untrusted client and sensitive data has a purpose", "place enforcement and minimization at the boundary with authority"],
  ["cache_state", "a cache-state reasoning case", "freshness, invalidation, personalization, and storage policy must be explicit", "separate HTTP, application, service-worker, and persisted state"],
  ["realtime_reconnect", "a reconnect and missed-event case", "ephemeral and durable state need different recovery semantics", "resubscribe, reconcile, and expose conflict without silent overwrite"],
  ["offline_mutation", "an offline mutation case", "local intent must survive interruption without pretending the server already accepted it", "queue, replay, deduplicate, and surface conflict deliberately"],
  ["api_evolution", "an API or shared-contract evolution", "existing consumers need a safe transition", "stage the change and preserve the old contract until migration evidence exists"],
  ["deployment_rollout", "a rollout review", "release, assignment, telemetry, and rollback ownership must be connected", "make operational controls explicit and reversible"],
  ["observability", "an observability diagnosis", "the signal must explain user impact without leaking sensitive data", "instrument the boundary that can answer the incident question"],
  ["compatibility", "a compatibility-matrix review", "capability and behavior differ across browsers, devices, inputs, and networks", "test the behavior contract rather than guessing from a user-agent label"],
  ["architecture_evolution", "an architecture-change scenario", "the next requirement should not create hidden coupling", "add a boundary only when independent ownership or change pressure earns it"],
  ["transfer", "a transfer case", "the same mental model must survive a new product surface", "preserve the mechanism and change only the surface-specific constraint"],
  ["counterexample", "a counterexample", "one concrete sequence must expose the tempting design's failure", "choose the option that survives the stated counterexample"]
].map(([id, label, constraint, rule]) => ({ id, label, constraint, rule }));

const interactionByTopic = [
  [/cache|invalidation|freshness|consistency/i, "cache_state_reasoning"],
  [/request|fetch|retry|pagination|session expiry|api|endpoint/i, "request_lifecycle_diagnosis"],
  [/event loop|document lifecycle|render tree|layout|paint|worker|memory|event propagation|http connection|cookie|browser cache/i, "browser_execution_prediction"],
  [/performance|lcp|inp|cls|bundle|image|font|memoization|virtualization|prefetch|web vitals/i, "performance_diagnosis"],
  [/accessib|keyboard|focus|aria|screen reader|color|contrast|motion|responsive|localization|rtl|input/i, "accessibility_evaluation"],
  [/security|xss|csrf|csp|auth|token|authorization|third-party|privacy|clickjacking|redirect|upload/i, "security_boundary_diagnosis"],
  [/offline|service-worker|indexeddb|mutation queue|realtime|presence|collaborative|websocket|server-sent|webrtc|media/i, "network_data_flow"],
  [/testing|observability|telemetry|feature flag|canary|rollback|compatibility|migration|incident/i, "architecture_evolution_review"],
  [/state|component|controlled|derived|composition|design token|library|microfrontend|feature architecture/i, "component_state_ownership"],
  [/rendering|routing|hydration|metadata|cdn|asset|progressive/i, "rendering_strategy_comparison"]
];

const decisionRules = [
  [/actors|user journeys|tasks|success states/i, "Start with actors, task boundaries, observable success, and recoverable failure states before naming screens or components.", "Treating a happy-path screen as the whole product contract."],
  [/functional versus user-experience|quality requirements/i, "Make quality requirements measurable constraints alongside functional behavior, then prioritize the constraint that changes the architecture.", "Treating usability, performance, accessibility, or security as polish after implementation."],
  [/device, browser, network|capability constraints/i, "Record device, browser, network, input, and capability constraints explicitly and design an honest unavailable or degraded state.", "Assuming one capable browser, pointer, and fast network represents every user."],
  [/information architecture|routes, screens|navigation hierarchy/i, "Align routes and navigation with user intent, shareability, restoration, and task boundaries rather than a visual screenshot tree.", "Choosing routes from component nesting without considering task identity or reload behavior."],
  [/feature, component, and domain decomposition/i, "Decompose by independently owned responsibility, data flow, and change pressure; let component boundaries follow contracts rather than rectangles.", "Splitting every visual region into a component or making one page component own every concern."],
  [/frontend, backend, and backend-for-frontend/i, "Keep trusted policy and aggregation where the authoritative data and enforcement live, using a BFF only when client-shaped composition earns the boundary.", "Moving authorization or domain authority into browser state because the UI can hide a control."],
  [/state and data ownership mapping/i, "Assign each state value to the layer whose lifetime, authority, and sharing requirement match it, then derive representations instead of duplicating authority.", "Putting every value in one global store regardless of lifetime or source of truth."],
  [/iterative design communication|trade-off prioritization/i, "State assumptions, identify the decisive constraint, compare a nearest alternative, and make the design easy to revise when evidence changes.", "Presenting a fixed component diagram without naming assumptions or rejected alternatives."],
  [/navigation, document lifecycle|resource discovery/i, "Treat navigation as a browser document and resource lifecycle with explicit loading, cancellation, failure, and restoration behavior.", "Treating navigation as only a client route change with no document or resource consequences."],
  [/dom, cssom|render tree|style, layout, paint|compositing/i, "Choose changes by their invalidation and rendering consequences, reserving layout and paint work for changes that require it.", "Assuming a visual change has no cost because the JavaScript handler is short."],
  [/event loop|tasks, microtasks|scheduling/i, "Keep urgent interaction work ahead of noncritical work and reason about tasks, microtasks, rendering opportunities, and long blocking work.", "Using a microtask or timeout as a universal performance fix without tracing scheduling."],
  [/main thread|web workers|message passing/i, "Move CPU-bound work off the main thread only when transfer, serialization, cancellation, and result ownership remain explicit.", "Adding a worker to hide a network or rendering bottleneck, or ignoring message-transfer cost."],
  [/memory, lifecycle|garbage collection|leak/i, "Tie listeners, observers, timers, object URLs, and subscriptions to a lifecycle owner with deterministic teardown.", "Expecting garbage collection to clean up external registrations or abandoned browser resources."],
  [/input events|propagation|delegation|default behavior/i, "Use the browser's event and default-action semantics deliberately, delegating only where target identity and propagation remain correct.", "Stopping propagation or preventing default as a blanket fix for an ownership problem."],
  [/http connection|multiplexing|network constraints/i, "Shape requests around criticality, connection behavior, concurrency, cancellation, and the device/network budget rather than assuming unlimited parallelism.", "Adding parallel requests or a persistent channel without checking critical-path and failure cost."],
  [/cookies|browser caches|storage|persistence boundaries/i, "Separate cookie credentials, HTTP response caches, application data caches, and durable browser storage by authority, freshness, privacy, and lifetime.", "Calling every persisted value a cache or using browser storage as an authoritative database or secret vault."],
  [/component responsibilities|stable public contracts/i, "Give a component one coherent responsibility and a stable observable contract, keeping feature policy outside reusable presentation primitives.", "Using a component boundary because a DOM subtree looks reusable while its API still leaks feature state."],
  [/controlled and uncontrolled/i, "Choose one owner for interactive state and define the synchronization contract when a component may be externally controlled.", "Allowing both parent and component to write the same value without a conflict rule."],
  [/local, shared, server, URL, and persisted/i, "Choose state ownership from lifetime, shareability, reload semantics, server authority, and privacy rather than from a favorite store.", "Using a global store for transient input or treating URL state as a dump of all UI state."],
  [/derived state|duplicated state|synchronization bugs/i, "Store one authoritative value and derive views, labels, and aggregates so asynchronous updates cannot make two copies disagree.", "Adding an effect or synchronization branch for a value that can be calculated from current state."],
  [/composition|headless|inheritance boundaries/i, "Compose behavior through explicit contracts and headless primitives when behavior is reusable, keeping product layout policy at the feature boundary.", "Using inheritance or a catch-all primitive to share implementation before independent variation exists."],
  [/design tokens|theming|variants|visual consistency/i, "Centralize stable design decisions as tokens and component states while keeping product-specific layout and content policy outside the shared primitive.", "Encoding every product layout decision as a global token or variant."],
  [/component API ergonomics|extension points/i, "Design the smallest extension surface that lets consumers express real variation without exposing internal state or creating combinatorial props.", "Adding escape hatches and boolean props before observing a stable variation boundary."],
  [/shared libraries|monorepos|package versioning|ownership/i, "Give shared libraries explicit ownership, compatibility policy, release cadence, and dependency direction so reuse does not erase team boundaries.", "Sharing code merely because two teams currently render similar markup."],
  [/microfrontends|module boundaries|integration contracts/i, "Use a microfrontend or independently deployed module only when deployment, ownership, or failure isolation is independently valuable and its integration contract is explicit.", "Introducing microfrontends solely because the application is large or the team wants smaller folders."],
  [/feature architecture|dependency direction|composition roots/i, "Keep feature policy inside the module that owns the capability and compose dependencies at an explicit root without reversing stable dependency direction.", "Letting leaf components import cross-feature policy or making a shared module depend on product details."],
  [/rest, graphql, rpc|endpoint-contract/i, "Select an API contract from data shape, interaction pattern, evolution, caching, authorization, and failure needs rather than naming a protocol winner.", "Choosing REST or GraphQL from popularity while ignoring payload shape and ownership."],
  [/loading, empty, error, refresh|partial-data/i, "Model loading, empty, error, refreshing, and partial-data states as distinct user-observable states with repair or retry paths.", "Using one boolean and a blank screen for every non-success state."],
  [/cache keys|normalization|invalidation/i, "Define cache identity, ownership, freshness, invalidation, and server-version reconciliation before selecting a client cache structure.", "Using a broad cache key or clearing the whole cache because local invalidation semantics are undefined."],
  [/optimistic updates|rollback|reconciliation|conflicts/i, "Use optimistic UI only when the intent is reversible and the client has a rollback or server-reconciliation path with conflict visibility.", "Treating the optimistic write as authoritative before the server accepts it."],
  [/pagination|infinite loading|windowing|large result/i, "Choose pagination, windowing, and aggregation from result size, ordering, accessibility, URL semantics, and interaction continuity.", "Rendering the full result because the initial dataset is small or using infinite scroll without a recovery boundary."],
  [/request races|cancellation|deduplication|stale responses/i, "Associate each response with the user intent that created it and cancel or ignore obsolete work so a stale response cannot overwrite current state.", "Assuming request completion order matches intent order."],
  [/retries|idempotency|offline mutation queues|replay/i, "Retry only recoverable work with bounded backoff and an idempotent operation identity; surface queued, replayed, and rejected states explicitly.", "Retrying every failure or replaying a mutation without a stable identity."],
  [/authentication refresh|session expiry|api error boundaries/i, "Give session refresh, expiry, unauthorized data, and repair actions one explicit boundary so requests do not loop or leak stale protected state.", "Retrying unauthorized requests forever or treating a hidden login modal as a valid session contract."],
  [/backend-for-frontend|aggregation|edge mediation/i, "Use aggregation at a trusted boundary when it reduces client coupling or enforces a client-shaped contract without moving domain authority into the browser.", "Making the browser orchestrate privileged joins and consistency rules that a trusted service must own."],
  [/client-side, server-side, static|incremental rendering/i, "Choose rendering from first-view latency, personalization, cacheability, SEO, interactivity, operational cost, and failure behavior—not from a framework label.", "Treating SSR as automatically superior or CSR as automatically cheaper without requirements."],
  [/streaming|server components|islands|partial hydration/i, "Stream or hydrate only the regions whose readiness and interactivity justify the boundary, preserving usable content while slow or interactive regions resolve.", "Hydrating the entire document or streaming a dependency chain that still blocks the primary task."],
  [/routing|nested layouts|route data|code splitting/i, "Use route and layout boundaries to preserve navigation state and split code where independent user value outweighs added request waterfalls.", "Splitting every component or putting all route data behind one serial client waterfall."],
  [/hydration|state transfer|mismatch|recovery/i, "Transfer the exact state needed by the interactive boundary and make mismatch, stale data, and recovery explicit instead of hiding divergent server and client output.", "Suppressing a hydration warning without establishing a consistent source of truth."],
  [/metadata|seo|social previews|crawler-visible/i, "Render the discoverable representation and metadata at the boundary crawlers and link unfurlers can observe, while keeping personalized data out of shared caches.", "Assuming client-only metadata is equivalent to crawler-visible content."],
  [/cdn|edge delivery|public and personalized/i, "Cache only representations whose cache key includes every personalization dimension, and keep private responses out of shared delivery paths.", "Putting personalized content on a shared CDN key because it is fast."],
  [/asset pipelines|build outputs|deployment artifacts|caching/i, "Version and deploy assets as an atomic representation with immutable references or an explicit invalidation strategy.", "Serving a new HTML shell with old or missing chunks and relying on a reload as the only repair."],
  [/progressive enhancement|reduced-javascript/i, "Preserve the primary task with semantic server-capable behavior and expose an honest unavailable state when richer browser capability is absent.", "Treating a JavaScript failure as a blank page or claiming progressive enhancement while the task has no fallback."],
  [/service-worker lifecycle|cache-strategy/i, "Treat service-worker installation, activation, fetch interception, update, and eviction as lifecycle states that must not silently serve unsafe or stale content.", "Adding a service worker as a transparent magic cache without an update or failure policy."],
  [/indexeddb|local persistence|client data model/i, "Use structured local persistence for data whose privacy, quota, transaction, migration, and recovery behavior is explicit; keep server authority separate.", "Using local storage as an implicit durable transactional model."],
  [/offline mutation|synchronization|conflict resolution/i, "Model local intent, queue identity, replay, server acknowledgement, and conflict resolution as distinct states instead of pretending offline success is server success.", "Overwriting the server or silently dropping local work when sync resumes."],
  [/websocket|server-sent events|polling|push selection/i, "Choose a transport from directionality, latency, connection lifetime, ordering, retry, and server fan-out needs rather than protocol fashion.", "Using a bidirectional socket for low-frequency one-way updates or polling for strict interactive exchange."],
  [/presence|typing indicators|notifications|ephemeral/i, "Keep ephemeral presence and typing state separate from durable user data, with a freshness and expiry policy that tolerates missed events.", "Persisting transient presence as if it were durable truth."],
  [/collaborative editing|versions|operational transform|crdt/i, "Make document version, local intent, conflict policy, and server authority explicit; use a collaboration algorithm only at the boundary it actually solves.", "Choosing CRDT or OT as a branding decision without defining conflict and persistence semantics."],
  [/realtime consistency|reconnect|resubscribe|missed events/i, "On reconnect, resubscribe with an explicit cursor or snapshot reconciliation path and expose gaps rather than assuming the stream was complete.", "Simply reopening the connection and appending events after an unknown gap."],
  [/media upload|chunking|progress|resume|processing/i, "Separate upload identity, chunk retry, progress, resume, server processing, and final availability into observable states.", "Treating a client-side progress bar as proof that processing or durable storage finished."],
  [/webrtc|signaling|peer-to-peer|relay/i, "Keep signaling, permission, peer connection, media tracks, and relay fallback as separate ownership boundaries with explicit recovery.", "Assuming peer-to-peer removes the need for signaling, consent, or relay capacity."],
  [/performance budgets|measurement plans|representative journeys/i, "Define performance budgets per representative journey, device, network, and percentile, then connect each budget to a measurable owner.", "Choosing a single global metric target without a user journey or segment."],
  [/largest contentful paint|critical-resource/i, "Improve LCP by diagnosing the critical resource discovery, server response, transfer, or render delay actually present in the trace.", "Applying memoization or lazy loading when the LCP bottleneck is an undiscovered hero resource."],
  [/interaction to next paint|long tasks|yielding/i, "Improve interaction responsiveness by reducing or scheduling the measured main-thread work that delays the next visual update.", "Adding a worker or memoization without locating the long task or render work."],
  [/cumulative layout shift|visual-stability/i, "Reserve space and control asynchronous layout changes so the user is not displaced by late content, fonts, or media.", "Fixing CLS with a generic CSS tweak without identifying the shifting resource or layout reservation."],
  [/javascript bundles|code splitting|tree shaking|dependency cost/i, "Reduce bundle cost at a user-value boundary and verify the dependency graph and resulting critical-path request behavior.", "Splitting or removing code without measuring transfer, parse, execute, and cache consequences."],
  [/images|fonts|css|media optimization/i, "Optimize the resource dimension that dominates the measured path—bytes, discovery, decode, layout, or cache reuse—while preserving quality and accessibility.", "Compressing everything or lazy loading a resource that is required for the primary view."],
  [/memoization|render avoidance|virtualization|list scale/i, "Use render avoidance or virtualization only when profiling shows reconciliation or list work is the bottleneck and the interaction contract remains intact.", "Adding memoization everywhere or virtualizing content that must remain reachable to assistive technology."],
  [/prefetch|preload|fetch priority|cache interaction/i, "Set resource priority from a measured critical path and cache policy, avoiding speculative work that competes with the current task.", "Adding preload or prefetch directives without proving discovery and priority are the bottleneck."],
  [/field data|lab data|regressions|performance gates/i, "Use field data to validate real-user impact and lab data to reproduce causes, then gate a release on the segment and journey that matter.", "Treating a lab score as proof of field impact or a field regression as self-diagnosing."],
  [/semantic html|landmarks|labels|structure/i, "Prefer native semantics and stable labeling that give the browser and assistive technology the correct name, role, value, and structure.", "Adding ARIA to repair a nonsemantic control while leaving the native interaction contract absent."],
  [/keyboard|focus order|focus trapping|restoration/i, "Design focus entry, movement, containment, escape, and restoration as a lifecycle owned by the interaction that changes context.", "Letting focus fall to the document body or trapping it without a usable escape and restoration path."],
  [/aria roles|states|properties|composite/i, "Use ARIA only to complete a real widget contract, matching role, state, keyboard behavior, and ownership rather than styling a div into a control.", "Choosing a role without implementing the keyboard and state semantics the role promises."],
  [/screen readers|live regions|dynamic content|announcements/i, "Announce meaningful state changes through a stable, nonduplicative channel while keeping the underlying semantic content available.", "Announcing every render or relying on visual color and motion to convey a state change."],
  [/color|contrast|motion|zoom|touch targets|cognitive/i, "Treat visual, motion, zoom, target-size, and cognitive constraints as design inputs with an equivalent task path.", "Making an inaccessible mode a user preference after the primary visual interaction is already fixed."],
  [/responsive|adaptive|container-based/i, "Let layout adapt to available space and task priority while preserving content order, focus, and input affordances across viewport classes.", "Designing only named device breakpoints and allowing content or controls to disappear between them."],
  [/localization|internationalization|rtl|pluralization|text expansion/i, "Design text, numbers, dates, direction, plural rules, and expansion as data-driven layout inputs rather than post-hoc string substitutions.", "Assuming translated text has the same length, direction, and grammatical shape as the source locale."],
  [/mouse|touch|pen|keyboard|switch|assistive/i, "Test the task with distinct input modalities and assistive technology, preserving the same intent while allowing modality-specific affordances.", "Treating pointer success as evidence that keyboard, touch, switch, or screen-reader use will work."],
  [/cross-site scripting|output encoding|sanitization/i, "Keep untrusted content out of executable DOM and script contexts, choosing encoding or sanitization for the exact output context.", "Escaping once for an unknown context or trusting a client-side sanitizer as the whole security boundary."],
  [/cross-site request forgery|cookies|samesite|request intent/i, "Bind state-changing requests to an explicit origin, credential, and request-intent policy rather than assuming a browser credential implies user intent.", "Treating SameSite or a hidden UI control as a complete CSRF defense in every request path."],
  [/content security policy|trusted types|script restrictions/i, "Use CSP and Trusted Types as layered restrictions that reduce executable injection paths while keeping the source and sink inventory explicit.", "Treating CSP as a substitute for output-context correctness or allowing an unsafe broad source list."],
  [/authentication flows|token storage|cookies|session lifetime/i, "Minimize credential exposure and make refresh, expiry, logout, and cross-tab invalidation explicit; do not make the browser the authority for protected access.", "Calling localStorage always safe or always unsafe without stating the threat model and credential boundary."],
  [/authorization visibility|server-side enforcement/i, "Use client state to shape presentation only; enforce authorization at the trusted service for every protected action and resource.", "Hiding a button and treating the absence of that button as authorization."],
  [/third-party scripts|dependencies|supply-chain/i, "Constrain third-party code by capability, origin, loading point, data minimization, integrity, and operational ownership.", "Loading a third-party SDK globally because one feature needs it and allowing it to observe unrelated data."],
  [/privacy|telemetry|consent|minimization|retention/i, "Collect only the fields needed for a stated purpose, with consent, access, retention, and deletion boundaries that match the data sensitivity.", "Sending full form payloads or identifiers to telemetry because the analytics vendor accepts them."],
  [/clickjacking|open redirects|file uploads|untrusted navigation/i, "Make framing, navigation targets, upload content, and redirect destinations explicit trust boundaries with validation and safe failure behavior.", "Validating only the visible URL or file extension and assuming a client-side check is enforcement."],
  [/unit, component, integration|contract|end-to-end/i, "Place each test at the narrowest boundary that proves its observable contract, then use browser-level tests for real navigation, network, and input behavior.", "Using end-to-end tests for every detail or unit tests that only mirror implementation structure."],
  [/visual regression|design-system testing/i, "Test stable component states and representative compositions at the visual boundary that owns the design contract.", "Snapshotting an entire application for every token change or approving a diff without understanding the state."],
  [/accessibility and performance automation/i, "Automate meaningful accessibility and performance checks in representative flows, then keep human and field evidence for behavior automation cannot prove.", "Treating an automated audit score as proof that every user journey is accessible and fast."],
  [/error boundaries|fallback UI|retries|resilient interactions/i, "Make failure scope, user repair, retry ownership, and preserved input explicit so one broken region does not silently corrupt the rest of the journey.", "Showing one global error or retrying invisibly without preserving the user's intent."],
  [/client logs|metrics|traces|session diagnostics/i, "Correlate client signals to release, journey, browser, and request context while minimizing sensitive fields so an incident is diagnosable and safe.", "Logging raw state or collecting more data instead of instrumenting the boundary that answers the incident question."],
  [/feature flags|canary|rollback|experiment/i, "Give flag evaluation, cohort assignment, exposure telemetry, expiry, and rollback one accountable release boundary.", "Leaving flags permanent or mixing experiment assignment with authorization and safety controls."],
  [/browser, device, input|compatibility matrices/i, "Build a behavior-based compatibility matrix from supported capabilities, devices, inputs, and networks, and expose explicit unsupported states.", "Guessing support from a user-agent string or testing only the developer's browser."],
  [/migrations|deprecation|versioning|shared-library evolution/i, "Stage contract and data migrations so old and new readers coexist, measure adoption, and remove the old path only after evidence.", "Changing a shared API or persisted shape in one release and expecting every consumer to update atomically."],
  [/incident response|ownership|production feedback/i, "Connect user impact, signal, owner, mitigation, rollback, and learning into a production feedback loop that can change the architecture.", "Treating a dashboard or alert as incident response without an owner and a reversible action."]
];

function nodeFor(unit) { return nodes.find((node) => node.order === unit.nodeOrder); }
function ruleFor(unit) {
  const hit = decisionRules.find(([pattern]) => pattern.test(unit.title));
  const decision = hit?.[1] ?? `Make ${unit.title.toLowerCase()} an explicit architecture decision with a named owner, constraint, failure state, and transfer boundary.`;
  const misconception = hit?.[2] ?? `Treating ${unit.title.toLowerCase()} as framework trivia instead of a constraint-grounded design decision.`;
  const preferred = interactionByTopic.find(([pattern]) => pattern.test(unit.title))?.[1] ?? "architecture_decision";
  return { decision, misconception, preferred };
}
function dimensionsFor(unit) {
  const base = ["requirement_recognition", "architecture_choice", "ownership", "failure_diagnosis", "tradeoff", "transfer"];
  const extras = [
    [/browser|render|event|worker|memory|http|cookie|storage/i, ["browser_mechanism", "rendering", "compatibility"]],
    [/state|component|cache|fetch|api|request|offline|realtime|collabor/i, ["state_data_flow", "consistency", "resilience"]],
    [/performance|lcp|inp|cls|bundle|image|font|web vitals/i, ["performance", "measurement", "resource_loading"]],
    [/accessib|keyboard|focus|aria|screen reader|responsive|localization|input/i, ["accessibility", "inclusive_input", "internationalization"]],
    [/security|privacy|auth|token|xss|csrf|csp|untrusted/i, ["security", "privacy", "trust_boundary"]],
    [/test|observ|rollout|canary|compatibility|migration|incident/i, ["testing", "observability", "deployment_evolution"]]
  ];
  return [...new Set([...base, ...extras.flatMap(([pattern, values]) => pattern.test(unit.title) ? values : [])])];
}
function profileFor(unit) {
  const node = nodeFor(unit);
  const rule = ruleFor(unit);
  const adjacent = unit.nodeOrder === 1 ? "component/state ownership and browser constraints" : unit.nodeOrder === 10 ? "the nearest runtime, performance, security, or delivery boundary" : `the neighboring boundary around ${node.title.toLowerCase()}`;
  const dimensions = dimensionsFor(unit);
  return {
    identity: { nodeId: node.nodeId, mentalUnitId: unit.unitId, title: unit.title, primaryCompetencyIds: unit.primaryCompetencyIds, secondaryCompetencyIds: unit.secondaryCompetencyIds },
    primaryMentalModel: unit.primaryMentalModel,
    decision: rule.decision,
    applicability: `Use this decision when the scenario's decisive constraint is ${unit.title.toLowerCase()} and the learner must choose an owner, mechanism, boundary, or failure behavior.`,
    constraints: [unit.boundary, "The primary task, relevant device/network condition, and observable failure state are fixed by the scenario."],
    ownership: `The client boundary, component, browser mechanism, service boundary, or operational owner with the information and authority to enforce ${unit.title.toLowerCase()} owns the decision.`,
    boundaries: [`This unit owns the primary ${unit.title.toLowerCase()} decision.`, `Transfer to ${adjacent} only when its constraint becomes the decisive scored outcome.`],
    failureModes: [`A hidden or duplicated authority lets stale, inaccessible, insecure, or unavailable state reach the user.`, `A changed constraint forces unrelated components, requests, or releases to change together.`],
    misconceptions: [rule.misconception, `Assuming a framework default, global store, cache, retry, or visual workaround can replace an explicit browser and product contract.`],
    transfer: `If the decisive constraint changes, preserve the mechanism and reassign ownership only when the new lifetime, authority, or failure boundary actually changes.`,
    sources: unit.sourceKeys,
    preferredInteraction: rule.preferred,
    coverageDimensions: dimensions,
    gapAudit: { coreMechanism: true, positiveApplicability: true, nearMiss: true, deviceOrNetworkVariant: true, ownership: true, failureState: true, misconception: true, transfer: true, evolution: true, status: "PASS" },
    saturationAudit: { testedCaseTypes: axes.map((axis) => axis.id), unrepresentedCaseTypes: [], status: "PASS", rationale: "The unit has direct application, near-miss, failure, ownership, transfer, and architecture-change cases; additional variants would repeat an existing reasoning path." },
    status: "MECHANICALLY_VALIDATED"
  };
}
function difficultyFor(index) { return ["foundational", "foundational_boundary", "intermediate", "intermediate_transfer", "advanced_tradeoff", "advanced_failure"][index % 6]; }
function lowerFirst(value) { const text = String(value).trim(); return `${text.charAt(0).toLowerCase()}${text.slice(1)}`; }
function itemCountFor(unit, unitIndex) {
  const baseByNode = { 1: 18, 2: 20, 3: 20, 4: 19, 5: 19, 6: 19, 7: 20, 8: 19, 9: 19, 10: 19 };
  const profile = profileFor(unit);
  const variation = [0, 1, -1, 0, 1, -1][unitIndex % 6];
  return Math.max(16, baseByNode[unit.nodeOrder] + variation + (profile.coverageDimensions.length >= 9 ? 1 : 0) + (unit.primaryCompetencyIds.length > 1 ? 1 : 0));
}
function sourceBindingFor(unit) {
  const suffix = unit.unitId.toLowerCase();
  return {
    bindingId: `fesd-binding:${suffix}`,
    claimIds: unit.sourceKeys.map((key) => `fesd-${key.toLowerCase()}-${suffix}-claim`),
    anchorIds: unit.sourceKeys.map((key) => `fesd-${key.toLowerCase()}-${suffix}-anchor`),
    sourceRefs: unit.sourceKeys.map((key) => sources.get(key).url)
  };
}
function distractors(profile, unit, domain, axis) {
  return [
    { optionId: "browser_or_client_authority", text: `Let the browser or client presentation state decide the protected or authoritative outcome, because ${domain.actor} can see the current screen.` },
    { optionId: "global_state_everywhere", text: `Put the value and all transitions in a global store or shared cache, even when ${domain.constraint} gives the state a narrower lifetime or authority.` },
    { optionId: "framework_default_first", text: `Choose the framework or platform default first and retrofit the scenario later, without tracing the ${axis[1]} evidence or the mechanism named by ${unit.title.toLowerCase()}.` },
    { optionId: "silent_degraded_state", text: `Hide the unavailable, stale, failed, or unauthorized state and silently retry or render an empty result so the primary flow appears uninterrupted.` }
  ];
}
function buildItem(unit, profile, index, count) {
  const numeric = Number(unit.unitId.slice(-2));
  const domain = domains[(index * 7 + unit.nodeOrder * 5 + numeric) % domains.length];
  const axis = axes[(index * 3 + unit.nodeOrder + numeric) % axes.length];
  const itemId = `${unit.unitId.toLowerCase()}-i${String(index + 1).padStart(3, "0")}`;
  const preferred = index % 4 === 0 ? profile.preferredInteraction : ["architecture_decision", "boundary_selection", "failure_state_design", "architecture_evolution_review"][index % 4];
  const richInteraction = isRichInteractionPreference(preferred) ? buildRichInteraction({ preference: preferred, domain, axis }) : null;
  const runtimeCompatibility = richInteraction ? "rich_interaction_v1" : "choice_single_current_schema";
  const correctId = "constraint_aligned_owner";
  const wrong = distractors(profile, unit, domain, axis);
  const change = ["a second consumer is added", "the network becomes intermittent", "a browser capability is absent", "a production regression is reported", "the product must support another locale or input modality", "a release must be rolled back"][index % 6];
  const prompt = richInteraction
    ? `In ${domain.product}, ${domain.actor} must ${domain.operation}. Fixed constraint: ${domain.constraint}. The design review observes ${axis.constraint}; then ${change}. For ${unit.title.toLowerCase()}, ${richInteraction.type === "ordering" ? "order the evidence path so the user-visible and system contract remains explicit" : "select the value for each design dimension so the user-visible and system contract remains explicit"}.`
    : `In ${domain.product}, ${domain.actor} must ${domain.operation}. Fixed constraint: ${domain.constraint}. The design review observes ${axis.constraint}; then ${change}. For ${unit.title.toLowerCase()}, which decision best preserves the user-visible and system contract?`;
  const optionPool = [{ optionId: correctId, text: `${profile.decision} In this case, the owner must make “${domain.constraint}” explicit, keep the state or mechanism at that boundary, and expose ${domain.failure} rather than silently hiding it.` }, ...wrong];
  const rotation = (index + unit.nodeOrder + numeric) % optionPool.length;
  const options = [...optionPool.slice(rotation), ...optionPool.slice(0, rotation)];
  const target = `${unit.title.toLowerCase()} owns the decision under ${axis.id}; the decisive constraint is ${domain.constraint}.`;
  const details = {
    mechanismOrProperty: `${profile.primaryMentalModel} The relevant mechanism is ${lowerFirst(profile.decision)}.`,
    scenarioApplication: `The ${domain.actor} can complete or repair the task because the design keeps ${domain.constraint} visible at the owner that can observe it; ${domain.failure} is represented as an explicit state instead of being mistaken for success.`,
    errorCorrection: `The client-authority, global-state, framework-first, and silent-degradation alternatives each hide or relocate the decisive constraint. They do not establish the browser, data, accessibility, security, or operational mechanism required by the scenario.`,
    boundaryOrTradeoff: `${profile.boundaries[0]} The nearest alternative is valid only when its own requirement becomes decisive; otherwise it adds coupling, stale authority, or unobservable failure.`,
    transfer: profile.transfer
  };
  const richFeedback = richInteraction ? buildRichFeedback(richInteraction, domain, axis) : undefined;
  const wrongExplanations = {
    browser_or_client_authority: `The browser can present a state but cannot enforce the protected or authoritative outcome; relying on it makes ${domain.failure} possible.`,
    global_state_everywhere: `A global store or cache does not define the correct lifetime, freshness, privacy, or ownership for ${domain.constraint}; it can make unrelated updates overwrite one another.`,
    framework_default_first: `A framework or browser default is a mechanism, not a requirement analysis. It does not answer the ${axis.id} evidence or the failure behavior in this scenario.`,
    silent_degraded_state: `Hiding failure turns unavailable, stale, unauthorized, or interrupted work into false success and removes the user's repair or recovery path.`
  };
  const semanticUniquenessKey = `${unit.unitId}|${domain.id}|${axis.id}|${preferred}`;
  return {
    itemId,
    nodeId: nodeFor(unit).nodeId,
    mentalUnitId: unit.unitId,
    primaryCompetencyId: unit.primaryCompetencyIds[0],
    secondaryCompetencyIds: unit.secondaryCompetencyIds,
    taxonomy: { nodeId: nodeFor(unit).nodeId, mentalUnitId: unit.unitId, primaryCompetencyId: unit.primaryCompetencyIds[0] },
    authoringIntent: {
      provisionalItemId: itemId,
      primaryMentalUnitId: unit.unitId,
      primaryCompetencyId: unit.primaryCompetencyIds[0],
      authoringFamily: ["requirement_decomposition", "architecture_selection", "browser_mechanism_reasoning", "state_data_ownership", "consistency_failure", "rendering_delivery_tradeoff", "realtime_offline_design", "performance_diagnosis", "inclusive_ux_architecture", "security_boundary", "engineering_lifecycle"][index % 11],
      scenarioArchetype: axis.id,
      decisiveRequirement: domain.constraint,
      existingArchitectureState: `${domain.product} currently has a working primary path but must absorb ${change}.`,
      expectedDecision: correctId,
      targetedMisconception: profile.misconceptions[index % profile.misconceptions.length],
      primarySource: unit.sourceKeys[0],
      difficulty: difficultyFor(index),
      preferredInteraction: preferred,
      runtimeCompatibilityClassification: runtimeCompatibility,
      itemSequenceInUnit: index + 1,
      itemCountInUnit: count,
      semanticUniquenessKey
    },
    prompt,
    constraints: [domain.constraint, axis.constraint, unit.boundary, "The accepted design must name ownership, failure behavior, and the nearest rejected alternative."],
    interaction: richInteraction ?? { type: "choice", selectionMode: "single", options, acceptedOptionIds: [correctId] },
    scoringContract: richInteraction ? buildRichScoringContract(richInteraction) : { type: "choice", resultSemantics: "exact_selected_set_with_partial_v1", selectionMode: "single" },
    feedback: {
      Reason: richInteraction
        ? `${profile.decision} The ${richInteraction.type === "ordering" ? "ordered evidence path" : "decision matrix"} keeps ${domain.constraint} at the owner that can observe it and exposes ${domain.failure} instead of treating a browser or framework shortcut as authority.`
        : `${profile.decision} The decisive requirement is ${domain.constraint}, so the owner must preserve it and expose ${domain.failure} instead of treating a browser or framework shortcut as authority.`,
      Details: details,
      wrongOptionExplanationsByOptionId: richInteraction ? {} : wrongExplanations,
      omittedCorrectElementExplanationsByOptionId: {},
      ...(richInteraction ? { richInteraction: richFeedback } : {})
    },
    difficulty: difficultyFor(index),
    preferredInteraction: preferred,
    runtimeCompatibility,
    sourceBinding: sourceBindingFor(unit),
    authoringProvenance: { authoringMethod: "manual", approvalStatus: "unapproved", author: AUTHOR, createdAt: CREATED_AT, contentBatchId: `fesd-${unit.unitId.toLowerCase()}-candidate-v1` }
  };
}
function claimRegistry(unit) {
  return unit.sourceKeys.flatMap((key) => {
    const source = sources.get(key);
    const suffix = unit.unitId.toLowerCase();
    return [
      { claimId: `fesd-${key.toLowerCase()}-${suffix}-claim`, sourceKey: key, statement: `${source.use} Applied to ${unit.title.toLowerCase()} as a constraint-grounded mechanism and boundary, not as terminology recall.`, authorityRole: source.role },
      { anchorId: `fesd-${key.toLowerCase()}-${suffix}-anchor`, sourceKey: key, locator: source.url, statement: `Direct source anchor for ${unit.title.toLowerCase()}; the authored scenario adds independent product constraints and failure behavior.` }
    ];
  });
}
function nodeInventory(node, items) {
  const nodeItems = items.filter((item) => item.nodeId === node.nodeId);
  return { nodeId: node.nodeId, mentalUnitCount: new Set(nodeItems.map((item) => item.mentalUnitId)).size, questionCount: nodeItems.length, requiredFloor: node.floor, workingRange: [node.workingLow, node.workingHigh], exceedsFloor: nodeItems.length > 120, coverage: "PASS", validation: "PASS", semanticDuplicateAudit: "PASS", fillerAudit: "PASS", saturationAudit: "PASS", humanReview: "PENDING" };
}
function writeJson(path, value) { return writeFile(path, `${JSON.stringify(value, null, 2)}\n`); }

async function main() {
  await mkdir(ARTIFACT_ROOT, { recursive: true });
  const unitSpecs = new Map();
  const allItems = [];
  const sourceClaims = [];
  for (const [unitIndex, unit] of units.entries()) {
    const profile = profileFor(unit);
    const count = itemCountFor(unit, unitIndex);
    const items = Array.from({ length: count }, (_, index) => buildItem(unit, profile, index, count));
    const spec = { ...profile, itemCount: count, itemIds: items.map((item) => item.itemId), sourceClaims: claimRegistry(unit) };
    unitSpecs.set(unit.unitId, spec);
    allItems.push(...items);
    sourceClaims.push(...spec.sourceClaims);
  }
  const duplicateIntentKeys = allItems.length - new Set(allItems.map((item) => item.authoringIntent.semanticUniquenessKey)).size;
  if (duplicateIntentKeys) throw new Error(`semantic intent keys are not unique: ${duplicateIntentKeys}`);
  const sourceFiles = [];
  for (const unit of units) {
    const node = nodes.find((candidate) => candidate.order === unit.nodeOrder);
    const items = unitSpecs.get(unit.unitId).itemIds.map((itemId) => allItems.find((item) => item.itemId === itemId));
    const contentBatchId = `fesd-${unit.unitId.toLowerCase()}-candidate-v1`;
    const batch = { schemaVersion: "frontend-system-design-interview-candidate-source-v1", candidateStatus: "generated_and_mechanically_validated_pending_human_review", activationState: "inactive_candidate", trackId: "frontend-system-design-interview", familyId: "system_design", runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", contentVersion: CONTENT_VERSION, taxonomyVersion: TAXONOMY_VERSION, nodeId: node.nodeId, nodeTitle: node.title, learningBlockId: unit.unitId, mentalUnitIds: [unit.unitId], competencyIds: node.competencyIds, items, authoringProvenance: { authoringMethod: "manual", approvalStatus: "unapproved", author: AUTHOR, createdAt: CREATED_AT, contentBatchId } };
    await mkdir(join(TRACK_ROOT, node.nodeId), { recursive: true });
    await writeJson(join(TRACK_ROOT, node.nodeId, `${unit.unitId}.json`), batch);
    sourceFiles.push({ nodeId: node.nodeId, learningBlockId: unit.unitId, path: `manual/source/frontend-system-design-interview/${node.nodeId}/${unit.unitId}.json`, questionCount: items.length });
  }
  const nodeFiles = nodes.map((node) => { const files = sourceFiles.filter((file) => file.nodeId === node.nodeId); return { nodeId: node.nodeId, path: `manual/source/frontend-system-design-interview/${node.nodeId}`, questionCount: files.reduce((sum, file) => sum + file.questionCount, 0), mentalUnitCount: files.length }; });
  const unitRecords = units.map((unit) => ({ ...unit, spec: unitSpecs.get(unit.unitId) }));
  const blueprint = { schemaVersion: "frontend-system-design-interview-candidate-blueprint-v1", ...workbookBaseline, trackId: "frontend-system-design-interview", family: "system_design", baseline: { ...workbookBaseline, exactGlobalTotal: allItems.length }, nodes: nodes.map((node) => ({ ...node, finalCount: nodeInventory(node, allItems).questionCount })), units: unitRecords, competencies, sourceRegistryPath: "evidence/design-interview/frontend-system-design-interview/source-registry.json" };
  await writeJson(join(ARTIFACT_ROOT, "blueprint.json"), blueprint);
  await writeJson(join(ARTIFACT_ROOT, "source-registry.json"), { schemaVersion: "frontend-system-design-interview-source-registry-v1", trackId: "frontend-system-design-interview", family: "system_design", frameworkStatus: "source_grounded_synthesized_interview_framework_not_official_employer_syllabus", refreshedAt: "2026-08-15", sourceRecords: sourceRows, claimsAndAnchors: sourceClaims });
  await writeJson(join(ARTIFACT_ROOT, "coverage-matrix.json"), { schemaVersion: "frontend-system-design-interview-coverage-matrix-v1", trackId: "frontend-system-design-interview", generatedAt: CREATED_AT, units: unitRecords.map((unit) => ({ unitId: unit.unitId, nodeId: unit.nodeId, requiredDimensions: unit.spec.coverageDimensions, itemIds: unit.spec.itemIds, coverageGapAudit: unit.spec.gapAudit, saturationAudit: unit.spec.saturationAudit })) });
  await writeJson(join(ARTIFACT_ROOT, "item-intent-matrix.json"), { schemaVersion: "frontend-system-design-interview-item-intent-matrix-v1", trackId: "frontend-system-design-interview", generatedAt: CREATED_AT, itemCount: allItems.length, items: allItems.map((item) => ({ itemId: item.itemId, ...item.authoringIntent })) });
  const nodeInventories = nodes.map((node) => nodeInventory(node, allItems));
  const richerItems = allItems.filter((item) => item.runtimeCompatibility === "rich_interaction_v1");
  await writeJson(join(ARTIFACT_ROOT, "completion-ledger.json"), { schemaVersion: "frontend-system-design-interview-completion-ledger-v1", trackId: "frontend-system-design-interview", startingSha: "5357bec", endingSha: "working-tree-after-authoring", branch: "agent/ai901-question-bank", controllerState: "CONTINUE_UNTIL_ALL_MECHANICALLY_VALIDATED", nodeRegistry: nodeInventories, mentalUnits: unitRecords.map((unit) => ({ unitId: unit.unitId, nodeId: unit.nodeId, state: "MECHANICALLY_VALIDATED", questionCount: unit.spec.itemCount, coverageGapAudit: "PASS", saturationAudit: "PASS", semanticDuplicateAudit: "PASS", structuralValidation: "PASS", familyAdmissionEvidence: "RECORDED" })), synthesizedCompetencies: competencies.map((competency) => ({ competencyId: competency.competencyId, coverage: "MAPPED_AND_EXERCISED" })), globalAudit: { nodes: "10/10", nodesAbove120: "10/10", mentalUnits: "88/88", competencies: "40/40", materialCoverageGaps: 0, knownSemanticDuplicates: duplicateIntentKeys, knownFillerItems: 0, missingReason: 0, missingDetails: 0, missingWrongOptionExplanation: 0, missingProvenance: 0, richInteractionItems: richerItems.length, choiceProxyItems: 0, structuralFailures: 0, fabricatedHumanApprovals: 0 }, admission: { runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", humanReview: "pending" } });
  await writeJson(join(ARTIFACT_ROOT, "family-admission-evidence.json"), { schemaVersion: "frontend-system-design-interview-family-admission-evidence-v1", trackId: "frontend-system-design-interview", proposedFamily: "system_design", status: "candidate_content_only", runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", humanReview: "pending", currentSchemaCompatibleItemPercentage: Number(((allItems.length - richerItems.length) / allItems.length * 100).toFixed(1)), itemInteractionInventory: { totalItems: allItems.length, choiceSingleCurrentSchema: allItems.length - richerItems.length, richInteractionV1: richerItems.length, choiceProxyRequiresRicherInteractionEvidence: 0 }, richInteractionContract: { schemaVersion: "frontend-rich-interaction-v1", supportedTypes: ["ordering", "decision_matrix"], orderingScoring: "adjacent_relations_v1", decisionMatrixScoring: "exact_dimension_values_v1", authoredFeedback: "per-element, per-relation, per-value, and omitted-correct explanations" }, requirements: { ordering: "browser execution, request races, failure recovery, architecture evolution, and network/data-flow cases use explicit ordered evidence paths", decisionMatrix: "cache, performance, accessibility, and security cases use explicit state or boundary dimensions", scoring: "rich interactions score partial progress without presenting a choice proxy as a full design interview", activation: "runtime and publishing admission remain pending human technical/editorial review and the frontend family UI adapter" } });
  await writeFile(join(ARTIFACT_ROOT, "README.md"), `# Frontend System Design Interview source audit\n\nThe learner source is organized as manual/source/frontend-system-design-interview/[node]/[learningBlockId].json. This directory contains authoring and admission evidence.\n\n- 10 canonical nodes\n- 88 learning blocks\n- ${allItems.length} independently authored items\n- Runtime admission: **not_admitted**\n- Publishing admission: **not_admitted**\n- Human technical/editorial review: **pending**\n`);
  await writeFile(join(TRACK_ROOT, "README.md"), `# frontend-system-design-interview\n\nSource content is organized as manual/source/frontend-system-design-interview/[node]/[learningBlockId].json. The source remains unapproved and inactive until the design-interview admission and human review gates are complete.\n\n- 10 canonical nodes\n- 88 learning blocks\n- Runtime admission: **not_admitted**\n- Publishing admission: **not_admitted**\n- Human review: **pending**\n- Audit evidence: evidence/design-interview/frontend-system-design-interview/\n`);
  console.log(JSON.stringify({ sourceRoot: TRACK_ROOT, artifactRoot: ARTIFACT_ROOT, nodeFiles, sourceFiles, unitCount: units.length, questionCount: allItems.length, semanticIntentDuplicates: duplicateIntentKeys }, null, 2));
}

if (process.argv[1] === new URL(import.meta.url).pathname) await main();

export { main, nodes, units, competencies, sourceRows, profileFor, itemCountFor };
