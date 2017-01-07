#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');

let args = process.argv.slice(2);

let cwdPkgJson = require('./package.json');
let dependencies = 'dependencies'
args = args.filter(arg => {
  if (['--save-dev', '-D', '--saveDev'].indexOf(arg) > 0) {
    dependencies = 'devDependencies';
    return false
  }
  return true;
})
cwdPkgJson[dependencies] = cwdPkgJson[dependencies] || {};

let ctr = 0;


args.forEach(pkg => {
  spawn('npm', ['link', pkg], { stdio: 'inherit', shell: true }).once('exit', () => {
    const linkedPkgJson = require(pkg + '/package.json');
    cwdPkgJson[dependencies][pkg] = '^' + linkedPkgJson.version;
    done();
  })
})

function done() {
  if (++ctr < args.length) return;
  cwdPkgJson[dependencies] = sort(cwdPkgJson[dependencies])
  fs.writeFileSync('package.json', JSON.stringify(cwdPkgJson, null, 2));
}

function sort(obj) {
  const sorted = {}
  const keys = Object.keys(obj).sort();
  keys.forEach(k => sorted[k] = obj[k]);
  return sorted;
}