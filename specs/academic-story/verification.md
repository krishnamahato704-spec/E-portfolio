# Home revision verification

12 November 2026. The owner corrected the requested location to Home and explicitly authorized publication. The summary appears before the preserved original Home opening; About keeps its existing introduction and full academic record. Two different full-width timeline chapters distinguish the teaching journey and education. Professional Learning has a quieter separate band.

Local verification used bundled Node.js 24.22.1 and installed Microsoft Edge. All 128 unit tests passed. The focused Home check passed at 320, 390, 768 and 1440 pixels, including summary order, newest-first records, distinct background colors, visible rails, no page overflow, keyboard navigation, unchanged About introduction and no-JavaScript content. Home WCAG A/AA axe checks reported no violations at all four sizes. Source review and screenshot inspection found no blocking issues. The identity suite passed 50/50 checks, including sustained deferred film loading, offscreen pause, replay scene location, Escape/focus restoration, mobile, failure fallbacks and gallery controls.

The full browser, recruiter and packaged loading suites are checked before publication; their actual results are retained in the local outputs. Production publication uses the existing main-branch GitHub Pages pipeline and Git-linked Vercel project. A successful source push alone is not treated as a successful deployment.

The recruiter access suite passed 105/105 checks, the packaged performance regression suite passed 19/19 checks, and the palette suite passed 182/182 text/action/control pairs. These local browser runs used installed Edge; production CI also exercises its configured browsers.
