const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

/**
 * Parses a semver-like string into [major, minor, patch] integers
 */
function parseSemVer(ver) {
  if (!ver) return [0, 0, 0];
  const clean = String(ver).replace(/^v/, '').split('-')[0];
  const parts = clean.split('.').map((n) => parseInt(n, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

/**
 * Compares two SemVer strings (returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal)
 */
function compareSemVer(v1, v2) {
  const p1 = parseSemVer(v1);
  const p2 = parseSemVer(v2);
  for (let i = 0; i < 3; i++) {
    if (p1[i] > p2[i]) return 1;
    if (p1[i] < p2[i]) return -1;
  }
  return 0;
}

/**
 * Finds the latest Git tag starting with 'v<number>'
 */
function getLatestTag() {
  try {
    const tagOutput = execSync('git describe --tags --abbrev=0 --match "v[0-9]*"', {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return tagOutput.toString().trim();
  } catch {
    return '';
  }
}

/**
 * Gets commit messages since the last release tag (or recent commits if no tag)
 */
function getRecentCommitMessages(lastTag) {
  try {
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
 * Resolves current base version from the latest Git tag, falling back to package.json.
 * If package.json has a manually specified higher version, that higher version takes precedence.
 */
function getBaseVersion(lastTag) {
  const pkgVer = packageJson.version || '0.1.0';
  if (!lastTag) return pkgVer;

  const tagMatch = lastTag.match(/^v?(\d+\.\d+\.\d+)/);
  const tagVer = tagMatch ? tagMatch[1] : null;

  if (!tagVer) return pkgVer;

  return compareSemVer(pkgVer, tagVer) > 0 ? pkgVer : tagVer;
}

/**
 * Calculates new semantic version from base version and commit messages
 */
function calculateNextVersion(baseVersion, commitMessages) {
  const [maj, min, pat] = parseSemVer(baseVersion);
  let major = maj;
  let minor = min;
  let patch = pat;

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
  const cleanBase = `${maj}.${min}.${pat}`;
  return { nextVersion, bumpType, changed: nextVersion !== cleanBase };
}

function run() {
  const lastTag = getLatestTag();
  const baseVersion = getBaseVersion(lastTag);
  const commitMessages = getRecentCommitMessages(lastTag);
  const { nextVersion, bumpType, changed } = calculateNextVersion(baseVersion, commitMessages);

  const shouldWrite = process.argv.includes('--write');

  if (shouldWrite && (changed || packageJson.version !== nextVersion)) {
    const prevPkgVersion = packageJson.version;
    packageJson.version = nextVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    console.log(
      `Updated package.json version: ${prevPkgVersion} -> ${nextVersion} (Base from tag: ${baseVersion}, ${bumpType ? `${bumpType} bump` : 'no change'})`,
    );
  } else {
    console.log(`Latest Tag: ${lastTag || 'none'}`);
    console.log(`Base version: ${baseVersion}`);
    console.log(`Calculated next base version: ${nextVersion} (${bumpType ? `${bumpType} bump` : 'no change'})`);
  }
}

run();
