---
layer: application
type: application
subject: self-describing-model-packages
technique: config-frozen-artifact
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# An export that serializes every config as JSON into the compiled container

MONAI's bundle export, read at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`, freezes the configuration that produced a compiled model into the compiled model itself. The specification promises it and one function does it.

## The promise in the specification

`docs/source/mb_specification.rst:53` describes the TorchScript form of a bundle: the archive is a zip, the contents of `metadata.json` go in as the `meta_values` argument of `save_net_with_metadata`, other files go in as `more_extra_files` under an `extras` directory, and any tool that reads zip data can get them back. `:55` states the normalization rule in one sentence: config files may be provided as JSON or YAML, but "regardless of format the produced bundle Torchscript object will store the files as JSON". The specification's layout section (`:11`) had already said a bundle may be "included as extra files directly in a Torchscript file" — the compiled form is a package in miniature, which is the technique's framing.

## The function

`_export` (`monai/bundle/scripts.py:1277-1338`) is the whole technique in forty lines of body. Its docstring (`:1300-1303`) restates the contract: the saved key is "the config filename without extension, and the saved config value is always serialized in JSON format no matter the original file format is JSON or YAML". The body:

1. instantiates the network from the parser by id and loads the checkpoint into it (`:1311-1316`), through `Checkpoint.load_objects` when the training engine library is present and `torch.load(..., weights_only=True)` plus `copy_model_state` otherwise;
2. runs the caller's `converter` — TorchScript tracing or ONNX export — over the loaded module (`:1319`);
3. for every config file the caller named, takes the base name, strips the extension, and **refuses on collision**: `if filename in extra_files: raise ValueError(f"Filename part '{filename}' is given multiple times in config file list.")` (`:1321-1329`), with the comment "because all files are stored as JSON their name parts without extension must be unique";
4. loads each file through `ConfigParser.load_config_file` and re-dumps it with `json.dumps(...).encode()` (`:1331`), so a YAML source and a JSON source land as the same serialization;
5. re-keys every entry with a `.json` suffix (`:1334`);
6. pops the metadata out of the parser (`parser.get().pop("_meta_", None)`, `:1336`) and hands it to the `saver` as `meta_values`, with the frozen configs as `more_extra_files` (`:1337`).

The loaded checkpoint, the converter and the frozen configs meet in one call, so the artifact that leaves carries the configuration that built it and the metadata that describes it, in one format, keyed by name.

## What this realization cannot do

The embedded configs are the files as loaded, not the resolved object graph — references and expressions are still in their source form, so a consumer without the config language can read the arguments but not evaluate them. The export records nothing about the converter's own parameters; a traced-versus-scripted choice, or an ONNX opset, is not in the frozen set. And nothing in the tree performs the reverse check — rebuild from the embedded configs and compare — so drift between a bundle's current config and its shipped compiled form is detectable in principle and undetected in practice.
