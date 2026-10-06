#!/usr/bin/env node
/**
 * launch - the process that runs INSIDE the new console window dispatch.mjs opens.
 *
 *   node launch.mjs <promptFile> <statusFile> <model>
 *
 * Why it exists: `claude --cloud` refuses unless stdout is an interactive terminal, and the
 * agent that decides to dispatch has none. dispatch.mjs starts this script through
 * `cmd /d /c start "<title>" node launch.mjs ...`, which opens a fresh console whose std handles
 * are that console (measured 2026-10-06: a bare `detached: true, stdio: 'ignore'` spawn also gets
 * its own console but NUL std handles - a probe child saw stdoutTTY/stdinTTY false - so
 * `claude --cloud` would refuse). Here `claude` inherits the
 * console as its TTY, creates
 * the cloud session and exits by itself. The outcome is written to <statusFile> so
 * `dispatch.mjs --status` can tell a failed launch from a running one. On failure the window
 * stays open 60 s so a human can read the error.
 *
 * `claude` is a native executable: it is spawned without a shell, so the prompt is passed as
 * one argument and nothing in it is interpreted.
 */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const [promptFile, statusFile, model = 'opus'] = process.argv.slice(2);
const writeStatus = (exit, error) => {
  try { fs.writeFileSync(statusFile, `${JSON.stringify({ exit, error, ended: new Date().toISOString() })}\n`); } catch { /* the window still shows it */ }
};

if (!promptFile || !statusFile) {
  console.error('usage: node launch.mjs <promptFile> <statusFile> <model>');
  process.exit(2);
}

let exit = null;
let error = null;
try {
  const prompt = fs.readFileSync(promptFile, 'utf8');
  console.log(`cloud-dispatch: starting a ${model} cloud session (${prompt.length} chars) from ${process.cwd()} - this window closes by itself`);
  const r = spawnSync('claude', ['--model', model, '--cloud', prompt], { stdio: 'inherit' });
  if (r.error) error = r.error.message;
  exit = r.status;
  if (exit !== 0 && !error) error = r.signal ? `claude killed by ${r.signal}` : `claude exited ${exit}`;
} catch (e) {
  error = e.message;
}
writeStatus(exit, error);

if (exit !== 0) {
  console.error(`cloud-dispatch: launch failed - ${error}`);
  console.error('this window closes in 60 s');
  setTimeout(() => process.exit(1), 60_000);
}
