# Typography and color refinement

9 November 2026. This follow-up refines the interactive atlas and preserves its layout, facts, opening sequence and connected infrastructure.

The earlier Source Serif 4 display typography had tight minus .075em tracking, especially on the italic line. Small supporting details were difficult to read beside the large title. Blue-tinted surfaces throughout the page and bright lime accents also competed with the text.

The current display family is Instrument Serif, using its actual 400 regular and italic faces at minus .025em tracking. Source Sans 3 remains the body and UI family; Source Serif 4 remains available for prose. Large titles on the public inner pages use the same display family. Owner Studio and the résumé retain their existing heading treatment. The opening pairs a Source Sans first name with an italic Instrument surname.

Reading surfaces are warm paper #F4F1E8 and off-white #FCFAF4 with ink #22283F. The hero uses deeper indigo #243BA5 and warm-white #FAF7EE. Citron #DBE6AE replaces the bright lime accent. The Student scene is pale sage #E6E8D4 with dark contours. The manifesto uses navy #1E263F. Atlas lines are quieter, and essential hero metadata and controls are larger.

Instrument Serif comes from the shared library's verified google-instrumentserif entry. Both unmodified files match the catalogue SHA-256 hashes; together they add 141,604 bytes before HTTP compression. Its full [SIL OFL notice](../assets/fonts/Instrument-Serif-OFL.txt) is packaged beside the fonts. [Pinned source](https://github.com/google/fonts/tree/67bc647ce1910e92f461bcc82aae30f21d21a9cc/ofl/instrumentserif). No remote font request or system installation is used. Home preloads both faces, and production font URLs receive file-content cache keys.

Current style data is in type-color-theme.json. The earlier atlas/opening manifests describe the previous iteration and remain as historical references.

The theme is saved project-only as `captured-teacher-portfolio-indigo-and-paper-e9db31ea4db7`; supplied contrast checks passed. The earlier evidence hover used .88 opacity and produced 4.2:1 contrast for secondary copy on the new paper color. Its final .94 opacity passed the existing color-contrast check in Chromium and WebKit. Narrow phone controls retain 44px targets and fit on one line at320px.

Validation: build passed; 97/97 unit tests; static checks for113 files; existing browser suite311/311; atlas34/34; opening50/50; reading-room42/42 in the relevant browser runs. Glyph Range measurements, actual font-face load status and screenshots were inspected at1440px,390px and320px. A720 CSS px/DPR2 reflow sample was also inspected; this was not an actual browser UI zoom test. Final320px/390px viewport checks at844px high show no action/footer overlap or shortcut-bar obstruction. The last CSS follow-up was covered by the reading-room suite and final phone audit.

All original homepage IDs, link destinations and data-hook names remain. Supabase, owner authentication, contact handling, Vercel configuration, CI workflows, dependency files and factual content remain unchanged. Nothing was committed, pushed or deployed.
