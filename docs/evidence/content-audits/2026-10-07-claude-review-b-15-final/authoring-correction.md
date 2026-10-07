# Cause and repair note

The v2 answer decisions were independently confirmed against the stems, but the choices still made the key conspicuous: fourteen keyed choices were the sole longest option, and the keyed set used substantially more explanation than the alternatives. The v2 reviewer specifically flagged 14 items for this issue and retained depth-63 unchanged as PASS. The problem is an option-design cue, not a scoring or key-mapping defect.

For v3, I rewrote the displayed choices item by item from each exact stem and independently confirmed correct decision. Each set now presents a complete competing workflow or implementation path; the wrong choices differ on the controlling mechanism or evidence while remaining plausible enough to compare. I removed explanation that belongs in feedback, revised every wrong-option explanation and the concise error-correction detail to fit the new alternatives, and assigned new stable option IDs to the 14 rewritten objects. I carried depth-63 forward byte-for-byte at the question-object level, retaining its v2 hash.

One scope correction applies to replacement depth-75. The scenario now explicitly describes an application-managed cache of rendered prompt blocks before provider calls, so it does not suggest Anthropic's provider prompt cache accepts caller-defined policy-version keys or has a vendor isolation defect. Its source reference and detail URL now point to the registered OWASP multi-tenant source; its correct choice and feedback bind tenant-specific content to the application cache entry while preserving common-block reuse. The MCP source proposals remain unchanged from v2.

This is an authoring repair draft. It has not received independent v3 review or publication approval.
