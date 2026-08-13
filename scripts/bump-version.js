const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Reads current package.json version
 */
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version || '0.1.0';

/**
 * Gets commit messages since the last stable release tag (vX.Y.Z)
 */
function getRecentCommitMessages() {
  try {
    let lastTag = '';
    try {
      const tagOutput = execSync('git describe --tags --abbrev=0 --match "v[0-9]*.[0-9]*.[0-9]*"', {
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      lastTag = tagOutput.toString().trim();
    } catch {
      lastTag = '';
    }

    const logCommand = lastTag
      ? `git log ${lastTag}..HEAD --pretty=format:"%s%n%b"`
      : 'git log -n 50 --pretty=format:"%s%n%b"';
    const logs = execSync(logCommand, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    return logs.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Calculates new semantic version
 */
function calculateNextVersion(version, commitMessages) {
  const cleanVersion = version.replace(/^v/, '').split('-')[0];
  const parts = cleanVersion.split('.').map((n) => parseInt(n, 10) || 0);

  let major = parts[0] || 0;
  let minor = parts[1] || 0;
  let patch = parts[2] || 0;

  let bumpType = null; // 'major' | 'minor' | 'patch' | null

  for (const msg of commitMessages) {
    if (msg.includes('BREAKING CHANGE:') || /^[a-z]+(\(.*\))?!:/.test(msg)) {
      bumpType = 'major';
      break; // Highest precedence
    }
    if (/^feat(\(.*\))?:/.test(msg)) {
      if (bumpType !== 'major') bumpType = 'minor';
    } else if (/^(fix|perf)(\(.*\))?:/.test(msg)) {
      if (!bumpType) bumpType = 'patch';
    }
  }

  if (bumpType === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bumpType === 'minor') {
    minor += 1;
    patch = 0;
  } else if (bumpType === 'patch') {
    patch += 1;
  }

  const nextVersion = `${major}.${minor}.${patch}`;
  return { nextVersion, bumpType, changed: nextVersion !== cleanVersion };
}

function run() {
  const commitMessages = getRecentCommitMessages();
  const { nextVersion, bumpType, changed } = calculateNextVersion(currentVersion, commitMessages);

  const shouldWrite = process.argv.includes('--write');

  if (shouldWrite && changed) {
    packageJson.version = nextVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    console.log(`Updated package.json version: ${currentVersion} -> ${nextVersion} (${bumpType} bump)`);
  } else {
    console.log(`Current version: ${currentVersion}`);
    console.log(`Calculated next base version: ${nextVersion} (${bumpType ? `${bumpType} bump` : 'no change'})`);
  }
}

run();
