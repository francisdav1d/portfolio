// Run with: node scripts/check-hero-loading.cjs
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');

function loadComponent(name) {
  const filename = path.join(root, 'src/components', name + '.tsx');
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const component = new Module(filename);
  component.filename = filename;
  component.paths = Module._nodeModulePaths(root);
  // Use GSAP's equivalent CommonJS distribution for this Node-only render check.
  component.require = (id) => require(id === 'gsap/ScrollTrigger' ? 'gsap/dist/ScrollTrigger' : id);
  component._compile(compiled, filename);
  return component.exports[name];
}

function checkHeroLoading() {
  const Sprite = loadComponent('Sprite');
  const sprite = renderToStaticMarkup(React.createElement(Sprite));
  assert.match(sprite, /visibility:hidden/, 'Unloaded layers must never paint individually');
  assert.ok(!sprite.includes('hero-sprite-intro'), 'Entrance must not run before image decoding');
  assert.ok(!sprite.includes('smoke-puff'), 'Smoke must not finish while images are loading');

  const HeroVideo = loadComponent('HeroVideo');
  const video = renderToStaticMarkup(React.createElement(HeroVideo));
  assert.match(video, /<img[^>]+src="\/video\/poster.jpg"/, 'A separate poster must survive video buffering');
  assert.match(video, /<video[^>]+opacity:0/, 'An unready video must not cover the poster');

  const ProjectCard = loadComponent('ProjectCard');
  const project = { title: 'Example', youtubeId: 'example', image: '/example.jpg' };
  const card = renderToStaticMarkup(React.createElement(ProjectCard, { project }));
  assert.match(card, /loading="lazy"/, 'Offscreen thumbnails must not compete with the hero');
  const priorityCard = renderToStaticMarkup(React.createElement(ProjectCard, { project, priority: true }));
  assert.match(priorityCard, /loading="eager"/, 'First-row thumbnails remain eager');
  return 'PASS: seven hero loading regression assertions';
}

module.exports = checkHeroLoading;
if (require.main === module) console.log(checkHeroLoading());
