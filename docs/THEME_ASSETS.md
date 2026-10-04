# Theme artwork and portfolio soundtrack

Created on 4 October 2026 in response to the owner's request for stronger history and English motifs, music in the hero video, continuous playback and removal of the line beneath it.

## Saved assets

- `assets/theme/history-study.webp`: transparent illustration of an archival map, atlas, globe, compass, generic arch and stone fragments.
- `assets/theme/english-study.webp`: transparent illustration of an open book, manuscripts, quill, ink and book stack.
- `assets/theme/paper-texture.svg`: a small repeatable grain texture written as SVG.
- `assets/hero-video-music.mp4`: the original video stream with an original stereo instrumental keyboard score, 11.25 seconds long. The silent source is preserved in `assets/hero-video.mp4`.
- `assets/portfolio-film.vtt`: optional description of the instrumental audio, with no default visible captions.

The two raster illustrations were generated with the built-in image generation tool. The supplied website previews were style references. The images are decoration, not evidence of the owner's teaching or institutions. They have no logos, named landmarks or documentary claims. The generated PNG sources remain in the Codex generated-images directory; the project uses smaller 1200px WebP versions with transparency preserved.

The instrumental score was composed locally from a repeating four-chord sequence, soft keyboard harmonics, sustained tones and short echoes. It contains no vocals or sampled commercial recording. `scripts/compose-portfolio-music.mjs` saves the score and copies the existing video stream into the sibling MP4, encoding only the added audio as AAC. The ordinary site build uses the saved media and requires no music service. The optional authoring command accepts an FFmpeg executable path as its first argument.

The website tries automatic playback with music. If the browser rejects sound, the video keeps looping muted and the Sound on button enables the embedded music after a click. The visitor can mute music without stopping the film. A mute choice is retained for the browser session. Reduced-motion preferences keep the initial poster still until the visitor chooses play. Native pause and volume controls remain available.

## Final image prompts

History illustration:

> Use case: stylized-concept. Asset type: a transparent decorative illustration for the background edges of Krishna Mahato's history and English teaching portfolio. The two supplied images are STYLE REFERENCES ONLY: match their delicate sepia ink and graphite engraving, light watercolor washes, aged archival drawing style. Do not create a website mockup or copy any people or text. Generate one wide 3:2 composition of a history-study vignette: a rolled archival map, an old atlas with abstract unlabeled geographic contours, a small globe on a wood stand, an understated generic ruined arch and stone column fragments, a tiny compass rose, distant softly sketched mountain contours. Arrange the objects as a loose low horizontal cluster along the bottom with some map fragments drifting upward at the two outer edges. Keep the middle upper half mostly empty and fully transparent for website text. Warm restrained taupe, faded copper, gray-blue and ivory wash; fine hand-drawn lines, no heavy filled shapes, no modern icons. Edge lines dissolve gently into transparency. No named or recognizable landmark, no institution or logo, no readable text, no people, no watermark. Genuine transparent background, not white paper. This is decorative history pedagogy imagery, not documentary evidence.

English illustration:

> Use case: stylized-concept. Asset type: transparent decorative English pedagogy illustration for the edge and footer backgrounds of a warm ivory academic teaching portfolio. Both supplied website previews are STYLE REFERENCES ONLY. Match their fine archival pen drawing and pale watercolor, engraving-like delicate sepia ink, muted copper and gray-blue washes. Generate one wide 3:2 composition: an open literature book with no legible words, a quill and small ink bottle, loose manuscript sheets with faint abstract writing marks, a small stack of clothbound books, and a few subtle speech ribbons implied by flowing pen lines, representing reading, writing and dialogue. Distribute objects in a low cluster along the bottom, with the open book toward bottom-left, quill and ink near bottom-right, and sheets behind. Upper central two-thirds must be empty and transparent for webpage text. Draw objects with fine restrained lines; no photorealism, no thick dark filled shapes, no children's clip art. Gentle ragged watercolor edges dissolving into genuine transparency. No title, no readable text, no person, no named author or famous portrait, no logo, no watermark, no website mockup. Background must be transparent rather than paper. Decorative illustration only, not classroom evidence.
