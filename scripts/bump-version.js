const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function exec(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

// Find latest vX.Y.Z tag
const lastTag = exec('git describe --tags --abbrev=0 --match "v[0-9]*"');

// Get commit messages since that tag (or last 50 if no tag)
const logCmd = lastTag ? `git log ${lastTag}..HEAD --pretty=format:"%s%n%b"` : 'git log -n 50 --pretty=format:"%s%n%b"';
const messages = exec(logCmd).split('\n').filter(Boolean);

// Determine bump type from conventional commits
let bump = null;
for (const msg of messages) {
  if (msg.includes('BREAKING CHANGE:') || /^[a-z]+(\(.*\))?!:/.test(msg)) {
    bump = 'major';
    break;
  }
  if (/^feat(\(.*\))?:/.test(msg) && bump !== 'major') bump = 'minor';
  if (/^(fix|perf)(\(.*\))?:/.test(msg) && !bump) bump = 'patch';
}

// Parse and bump version
const base = (lastTag || pkg.version || '0.1.0').replace(/^v/, '').split('-')[0];
let [major, minor, patch] = base.split('.').map(Number);

if (bump === 'major') {
  major++;
  minor = 0;
  patch = 0;
} else if (bump === 'minor') {
  minor++;
  patch = 0;
} else if (bump === 'patch') {
  patch++;
}

const nextVersion = `${major}.${minor}.${patch}`;
const buildNumber = parseInt(exec('git rev-list --count HEAD') || '1', 10) || 1;

const shouldWrite = process.argv.includes('--write');
const isCI = process.argv.includes('--ci');

if (shouldWrite && pkg.version !== nextVersion) {
  pkg.version = nextVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`Updated package.json: ${base} → ${nextVersion} (${bump || 'no'} bump)`);
} else {
  console.log(`Version: ${nextVersion} (${bump || 'no'} bump from ${base})`);
}

// Output for GitHub Actions
if (isCI && process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `VERSION=${nextVersion}\nBUILD_NUMBER=${buildNumber}\n`);
}

console.log(`BUILD_NUMBER=${buildNumber}`);
