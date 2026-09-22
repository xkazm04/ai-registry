#!/usr/bin/env node

/**
 * OpenAI Image Tool — generate / edit images with GPT Image 2.5.
 *
 * Default model: `gpt-image-2.5-sunburst` (released 2026-09-08 alongside
 * `gpt-image-2.5-flare`). Sunburst spends longer and holds intricate detail —
 * the right default for brand work, illustration and anything a person will
 * look at closely; Flare is the same family at roughly half the latency and is
 * the better pick for bulk or draft passes (`--model gpt-image-2.5-flare`).
 * Both reason about structure before rendering and return PNGs as base64 up to
 * 3840px. They run through the standard Images API, so unlike the Leonardo flow
 * there is NO polling job — the call returns the image inline.
 *
 * Commands:
 *   generate --prompt "..." --output path.png
 *            [--size 1024x1024|1536x1024|1024x1536|auto] [--quality low|medium|high|auto]
 *            [--n 1] [--background transparent|opaque|auto] [--model <id>]
 *   edit     --prompt "..." --image in.png [--image in2.png ...] --output path.png
 *            [--size ...] [--quality ...]
 *
 * Requires OPENAI_API_KEY. Model ids verified 2026-09-22 against OpenAI's model
 * pages: `gpt-image-2.5-sunburst`, `gpt-image-2.5-flare`, and the older
 * `gpt-image-2`.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, resolve, basename } from "path";

const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
// Current OpenAI image model (verified 2026-09-22): gpt-image-2.5-sunburst, the
// detail-holding half of the GPT Image 2.5 pair. `--model` wins over the env var,
// which wins over this default; `gpt-image-2.5-flare` is the fast/cheap sibling
// and `gpt-image-2` is still accepted for reproducing an older asset.
const DEFAULT_MODEL = "gpt-image-2.5-sunburst";

/** `--model` wins over `OPENAI_IMAGE_MODEL`, which wins over the default. */
function modelOf(args) {
  return args.model || process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL;
}

function parseArgs(argv) {
  const args = {};
  const positional = [];
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        // allow repeated --image
        if (args[key] !== undefined) {
          args[key] = Array.isArray(args[key]) ? [...args[key], next] : [args[key], next];
        } else {
          args[key] = next;
        }
        i++;
      } else {
        args[key] = true;
      }
    } else {
      positional.push(argv[i]);
    }
  }
  return { command: positional[0], args };
}

function fail(obj) {
  console.error(JSON.stringify(obj, null, 2));
  process.exit(1);
}

function writeImage(b64, outputPath) {
  const buf = Buffer.from(b64, "base64");
  const absPath = resolve(outputPath);
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, buf);
  return { absPath, bytes: buf.length };
}

async function generate(args) {
  if (!API_KEY) {
    fail({
      error: "OPENAI_API_KEY not set",
      hint: "Add OPENAI_API_KEY to .env (or export it) to generate with GPT Image 2.5. " +
        "Get a key at https://platform.openai.com/api-keys. Until then, the Leonardo " +
        "backend (leonardo-image.mjs) is the working fallback.",
      model: modelOf({}),
    });
  }
  if (!args.prompt || !args.output) {
    fail({ error: "Usage: openai-image.mjs generate --prompt \"...\" --output path.png [--size 1024x1024] [--quality high]" });
  }
  const model = modelOf(args);
  const body = {
    model,
    prompt: args.prompt,
    n: parseInt(args.n || "1", 10),
    size: args.size || "1024x1024",
    quality: args.quality || "high",
  };
  if (args.background) body.background = args.background; // transparent|opaque|auto

  process.stderr.write(`[openai] ${model} generate ${body.size} quality=${body.quality}\n`);
  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    fail({ error: `OpenAI API ${res.status}`, details: t.slice(0, 800), model });
  }
  const data = await res.json();
  const items = data.data || [];
  if (items.length === 0) fail({ error: "No image returned", response: data });

  const outputs = [];
  items.forEach((item, i) => {
    const b64 = item.b64_json;
    if (!b64) return;
    const out = items.length > 1
      ? args.output.replace(/(\.\w+)?$/, `-${i + 1}$1`)
      : args.output;
    const { absPath, bytes } = writeImage(b64, out);
    outputs.push({ output: absPath, bytes });
  });

  console.log(JSON.stringify({ success: true, model, usage: data.usage, outputs }, null, 2));
}

async function edit(args) {
  const model = modelOf(args);
  if (!API_KEY) fail({ error: "OPENAI_API_KEY not set", model });
  if (!args.prompt || !args.image || !args.output) {
    fail({ error: "Usage: openai-image.mjs edit --prompt \"...\" --image in.png [--image in2.png] --output path.png" });
  }
  const images = Array.isArray(args.image) ? args.image : [args.image];
  const form = new FormData();
  form.append("model", model);
  form.append("prompt", args.prompt);
  form.append("size", args.size || "1024x1024");
  form.append("quality", args.quality || "high");
  for (const p of images) {
    const buf = readFileSync(resolve(p));
    form.append("image[]", new Blob([buf], { type: "image/png" }), basename(p));
  }

  process.stderr.write(`[openai] ${model} edit (${images.length} input image(s))\n`);
  const res = await fetch(`${BASE_URL}/images/edits`, {
    method: "POST",
    headers: { authorization: `Bearer ${API_KEY}` },
    body: form,
  });
  if (!res.ok) {
    const t = await res.text();
    fail({ error: `OpenAI API ${res.status}`, details: t.slice(0, 800), model });
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) fail({ error: "No image returned", response: data });
  const { absPath, bytes } = writeImage(b64, args.output);
  console.log(JSON.stringify({ success: true, model, usage: data.usage, output: absPath, bytes }, null, 2));
}

const { command, args } = parseArgs(process.argv);
switch (command) {
  case "generate":
    generate(args);
    break;
  case "edit":
    edit(args);
    break;
  default:
    console.error(`Unknown command: ${command || "(none)"}\nCommands: generate, edit`);
    process.exit(1);
}
