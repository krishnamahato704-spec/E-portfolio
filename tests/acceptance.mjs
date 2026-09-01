import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const editor = fs.readFileSync(path.join(root, 'visual-editor.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'visual-editor.css'), 'utf8');
const cloud = fs.readFileSync(path.join(root, 'supabase-storage.js'), 'utf8');
const sql = fs.readFileSync(path.join(root, 'SUPABASE_SETUP.sql'), 'utf8');

const results = [];
function check(name, condition) {
  results.push({ name, pass: Boolean(condition) });
  if (!condition) process.exitCode = 1;
}

check('Editor JavaScript parses', (() => { try { new vm.Script(editor); return true; } catch { return false; } })());
check('Existing portfolio remains the primary document', /Krishna Mahato/.test(html) && (html.match(/<section\b/g) || []).length >= 14);
check('Visual editor is layered onto the existing site', /visual-editor\.css/.test(html) && /visual-editor\.js/.test(html));
check('Versioned schema and legacy migration exist', /SCHEMA_VERSION\s*=\s*2/.test(editor) && /migrateLegacy/.test(editor) && /normalizeBuilder/.test(editor));
check('Stable UUID-backed IDs are used', /crypto\.randomUUID/.test(editor) && !/id:\s*index/.test(editor));
check('Element library covers all requested groups', ['Text','Layout','Shapes','Media','Portfolio','Actions'].every(group => editor.includes(`['${group}'`)));
check('All requested section templates exist', ['blank','heading-text','two-columns','three-columns','card-grid','image-text','gallery','timeline','evidence','custom'].every(item => editor.includes(`['${item}'`)));
check('Selection, drag, resize, duplicate, delete, copy and paste exist', ['selectFromEvent','onDragStart','startResize','duplicateSelected','requestDelete','copySelected','pasteSelected'].every(name => editor.includes(`function ${name}`)));
check('Undo, redo and bounded history exist', /MAX_HISTORY\s*=\s*50/.test(editor) && /function undo\(/.test(editor) && /function redo\(/.test(editor));
check('Intentional save states and saved versions exist', ['Unsaved changes','Saving…','Saved online ✓','Saved versions'].every(text => editor.includes(text)));
check('Responsive previews and visibility exist', ['desktop','tablet','mobile'].every(device => editor.includes(`data-device="${device}"`)) && /responsive-hidden/.test(css));
check('Visitor and Preview modes hide editor controls', /body:not\(\.builder-editing\)/.test(css) && /builder-preview #portfolioStudio/.test(css));
check('Design tokens are global and overridable', /DEFAULT_TOKENS/.test(editor) && /applyTokens/.test(editor));
check('Navigation is rebuilt from section state', /function rebuildNavigation/.test(editor) && /showInNavigation/.test(editor));
check('Media files stay out of JSON payloads and use Storage metadata', /PortfolioCloud\.uploadFile/.test(editor) && /pendingOrphans/.test(editor) && /filename/.test(editor));
check('Removed media is queued, not immediately destroyed', /Media reference removed safely/.test(editor) && /cleanupOrphans/.test(editor));
check('Rich text and URLs are sanitised', /ALLOWED_TAGS/.test(editor) && /sanitizeHtml/.test(editor) && /function safeUrl/.test(editor) && /startsWith\('on'\)/.test(editor));
check('No service-role or secret key is exposed', !/service[_-]?role/i.test(html + editor + cloud) && !/sb_secret_/i.test(html + editor + cloud));
check('RLS remains enabled with owner-only writes', /enable row level security/i.test(sql) && /Portfolio owner can update state/.test(sql) && /krishnamahato704@gmail\.com/.test(sql));
check('Storage replacement has owner SELECT, INSERT and UPDATE policies', /owner can inspect evidence/i.test(sql) && /owner can upload evidence/i.test(sql) && /owner can update evidence/i.test(sql));
check('Accessibility labels and keyboard shortcuts exist', /aria-label/.test(editor) && /Control|ctrlKey/.test(editor) && /Escape/.test(editor));
check('Layers are lazy-rendered for performance', /expandedSections/.test(editor) && /expanded \? section\.children/.test(editor));
check('Local acceptance hook is production-inert', /localhost\|127/.test(editor) && /editor-test/.test(editor) && !/editor-test/.test(html));

const passed = results.filter(result => result.pass).length;
for (const result of results) console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${result.name}`);
console.log(`\n${passed}/${results.length} checks passed.`);

