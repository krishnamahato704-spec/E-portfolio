# Cleanup audit — 10 September 2026

Baseline: `c279f3433d38ba9a8de41f81cbe8430c4ca5576b`. Work is isolated on `refactor/codebase-cleanup`; do not merge for this task.

## Findings before source edits

The codebase is small and dependency-free. The current twelve generated pages match their source, and the existing twelve tests pass. The visual baseline covers all routes at 320, 768 and 1440px; none overflow. The published website was inspected and screenshots captured before cleanup.

- **CSS:** four spacing variables have no consumers. Several identical declarations can be grouped within their existing layer. A small number of mobile rules repeat their inherited values. Layer order, breakpoint-specific overrides, focus styles, motion and print rules remain intentional. No CSS class is demonstrably unused after checking public templates, the editor template and runtime-created elements.
- **Public JavaScript:** `wire()` queries the whole document and binds handlers again after replacing main content. Detached handlers are garbage-collectable, so this is not evidence of an existing memory leak. Stable main-element delegation can remove this repeated initialization. The interaction guard runs on click, leaving a window between pointer press and click during a slow content response. Image error handlers do not cover images that already failed before initialization.
- **Admin JavaScript:** rebuilding the editor replaces its descendant nodes; their listeners do not accumulate on the retained document. Draft-target resolution is repeated for fields and uploads. Keep the established edit/publish flow and validation. Avoid a broad editor rewrite.
- **Supabase:** one public content request per page; authenticated editor requests are purposeful. The adapter has explicit owner checks, optimistic version locking, validated uploads and failure messages. Keep endpoint payloads, schema, policies and legacy enrichment unchanged. No live writes are needed for cleanup verification.
- **HTML:** shared views already generate the repeated structures. Wrappers and classes participate in layout, semantics or runtime selection. Keep all generated HTML and content unchanged.
- **Assets:** the portrait, four certificates, two fonts, favicon and no-script stylesheet are used. The manifest and font licence are supporting records, not dead assets. Remove none.
- **Documentation/configuration:** the README still says the earlier redesign is awaiting release. Correct that stale repository guidance and document the cleanup branch as the starting point for the next task. Extend the read-only validation workflow to the cleanup branch.

## Deliberately retained

Gallery, resource-row, upload, dialog and image-error styles are needed for dynamic states even when the default public collections are empty. Legacy content enrichment supports the existing saved document. Redundant validation at an upload boundary protects direct adapter callers as well as the editor; it is retained. No content rewrite, visual redesign, new animation, framework, dependency, database migration or security-policy change is planned.

## Baseline metrics

44 tracked files; CSS 2,126 lines / 43,111 bytes in the working copy; source JavaScript 310 lines / 50,585 bytes; tracked-file total 863,403 bytes. Final metrics will also use LF-normalized source bytes to exclude Windows line-ending noise.
