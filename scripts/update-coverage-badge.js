#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Run tests and get coverage
function getCoverage() {
  try {
    // First try to read from coverage report file
    if (fs.existsSync('coverage/coverage-summary.json')) {
      const coverageReport = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
      return coverageReport.total.lines.pct;
    }
    
    // Fallback: run tests and parse output
    const output = execSync('npm run test:cov', { encoding: 'utf8' });
    
    // Look for the coverage summary line
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('All files') && line.includes('%')) {
        const match = line.match(/All files\s+\|\s+(\d+\.\d+)/);
        if (match) {
          return parseFloat(match[1]);
        }
      }
    }
    
    // Try alternative pattern
    const coverageMatch = output.match(/All files\s+\|\s+(\d+\.\d+)/);
    if (coverageMatch) {
      return parseFloat(coverageMatch[1]);
    }
    
    console.error('Could not parse coverage from Jest output');
    return 0;
  } catch (error) {
    console.error('Error getting coverage:', error.message);
    return 0;
  }
}

// Determine badge color based on coverage
function getBadgeColor(coverage) {
  if (coverage >= 80) return 'brightgreen';
  if (coverage >= 60) return 'green';
  if (coverage >= 40) return 'yellow';
  if (coverage >= 20) return 'orange';
  return 'red';
}

// Update README.md with new badge
function updateBadge(coverage, color) {
  const readmePath = 'README.md';
  let readme = fs.readFileSync(readmePath, 'utf8');
  
  const newBadgeUrl = `https://img.shields.io/badge/test%20coverage-${coverage}%25-${color}`;
  
  // Replace existing badge
  const badgeRegex = /https:\/\/img\.shields\.io\/badge\/test%20coverage-[0-9.]*%25-[a-z]*/g;
  readme = readme.replace(badgeRegex, newBadgeUrl);
  
  fs.writeFileSync(readmePath, readme);
  console.log(`✅ Updated coverage badge to ${coverage}% (${color})`);
}

// Main execution
if (require.main === module) {
  const coverage = getCoverage();
  const color = getBadgeColor(coverage);
  
  console.log(`📊 Test Coverage: ${coverage}%`);
  updateBadge(coverage, color);
}

module.exports = { getCoverage, getBadgeColor, updateBadge }; 