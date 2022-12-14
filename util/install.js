const fs = require('fs');
const { powershell } = require('./shell.js');

(async () => {
  if (!fs.existsSync(`./node_modules`)) {
    console.log(`Running Install on project root`);
    const opts = { args: ['./'], v: true };
    await powershell('npm/install', opts);
  }

  var subRepos = ['api', 'blockchain', 'client'];
  for await (const repo of subRepos) {
    const pathTo = `./${repo}`;
    if (!fs.existsSync(`${pathTo}/node_modules`)) {
      console.log(`Running Install on ${repo}`);
      const opts = { args: [pathTo], v: true };
      await powershell('npm/install', opts);
    }
  }
})();
