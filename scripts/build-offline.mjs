import {readFile, writeFile} from 'node:fs/promises';
import {build} from 'vite';

const htmlPath = new URL('../index.html', import.meta.url);
const [source, cover, favicon, fieldPictures, itemPictures, wantedPictures, ...licenses] = await Promise.all([
  readFile(htmlPath, 'utf8'),
  readFile(new URL('../public/roam-cover.webp', import.meta.url), 'base64'),
  readFile(new URL('../public/roam.svg', import.meta.url), 'base64'),
  readFile(new URL('../public/field-portraits.webp',import.meta.url),'base64'),
  readFile(new URL('../public/item-portraits.webp',import.meta.url),'base64'),
  readFile(new URL('../public/wanted-portraits.webp',import.meta.url),'base64'),
  ...['three', 'fraunces', 'nunito'].map(name =>
    readFile(new URL('../public/licenses/' + name + '.txt', import.meta.url), 'utf8'))
]);

const marker = '<script type="module">';
const entry = source.indexOf(marker);
const end = source.indexOf('</script>', entry);
if (entry < 0 || end < 0) throw new Error('Could not find the browser entry in index.html');

const bundle = await build({
  configFile: false,
  publicDir: false,
  define: {
    __ROAM_OFFLINE_COVER__:JSON.stringify('data:image/webp;base64,'+cover),
    __ROAM_FIELD_PICTURES__:JSON.stringify('data:image/webp;base64,'+fieldPictures),
    __ROAM_ITEM_PICTURES__:JSON.stringify('data:image/webp;base64,'+itemPictures),
    __ROAM_WANTED_PICTURES__:JSON.stringify('data:image/webp;base64,'+wantedPictures)
  },
  build: {
    write: false,
    lib: {entry: 'src/open.js', name: 'RainbowRoam', formats: ['iife']},
    rolldownOptions: {output: {codeSplitting: false}}
  }
});
const output = (Array.isArray(bundle) ? bundle : [bundle]).flatMap(result => result.output);
const script = output.find(asset => asset.type === 'chunk')?.code;
const style = output.find(asset => asset.type === 'asset' && asset.fileName.endsWith('.css'))?.source;
if (!script || !style || output.length !== 2) {
  throw new Error('Expected one classic script and one stylesheet for the offline build');
}

const document = (source.slice(0, entry) + '<script>' +
  script.replace(/<\/script/gi, '<\\/script') + '</script>' + source.slice(end + 9))
  .replace(/<script data-offline-redirect>[\s\S]*?<\/script>\s*/, '')
  .replace('href="./roam.svg"', 'href="data:image/svg+xml;base64,' + favicon + '"')
  .replace('</head>', '<style>' + style + '</style>\n</head>')
  .replace('</html>', '<!-- Bundled software and font licenses\n' +
    licenses.join('\n\n').replaceAll('-->', '--&gt;') + '\n-->\n</html>');
for (const location of ['../Rainbow Roam.html', '../dist/Rainbow Roam.html']) {
  await writeFile(new URL(location, import.meta.url), document);
}
console.log('Built standalone Rainbow Roam.html');

