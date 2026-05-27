const fs = require('fs-extra');
const concat = require('concat');

(async () => {
  const distDir = './dist/frontendAngular/browser';
  const outputDir = './dist/elements';

  const files = fs.readdirSync(distDir)
    .filter(f => f.endsWith('.js'))
    .map(f => `${distDir}/${f}`);

  await fs.ensureDir(outputDir);
  await concat(files, `${outputDir}/umi-modal.js`);

  console.log('✅ umi-modal.js gerado em dist/elements/');
})();