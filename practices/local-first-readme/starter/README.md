# <product name>

> Starter. Replace every `<...>` and `TODO:` with this repo's specifics, then delete this block.
> Every line below must be true today. If something does not run locally yet, say so in a
> status line rather than describing what it will do.

<Sentence 1: the job it does.> <Sentence 2: who it is for.> <Sentence 3: what makes it
different.>

![<what the reader is looking at>](<docs/media/screenshot.png>)

TODO: one real screenshot or short GIF from a running instance. Never a placeholder, a logo, or
a design mock.

## Run it locally in two minutes

Free, no keys, no account. This is the default way to use <product name>.

Requires `<runtime> <version>`.

```sh
git clone <repo url>
cd <repo dir>
<install cmd>
<run cmd>
```

Open `<http://localhost:PORT>`.

TODO: run this on a clean machine with no keys set before publishing. If the app needs a key to
do anything at all, say so here in one sentence and point at the capability table below.

Status: <what runs without any key today, in one line, or delete this line if everything does>.

## Set it up with your AI

Run your agent CLI in the checkout and type `/onboarding`. It probes your runtime and
dependencies, asks which capabilities you want switched on, writes the keys into
`<.env.local or equivalent>`, verifies the app boots, and hands back a capability matrix of what
is on and what is limited.

## Local vs hosted

The features are identical. If the hosted version is ever better than this repository, that is
a bug. Hosted plans buy operation, not capability.

| | Local (this repo) | Hosted (<hosted name or URL>) |
| --- | --- | --- |
| Features | all | all |
| Your data | stays on your machine | <where it lives, in one phrase> |
| Model cost | your own keys, your own bill | included |
| Operation | you run it | zero ops, always on |
| Support | issues in this repo | <support channel> |
| Price | free | <priced on outcomes or operation, in one phrase> |

TODO: delete the hosted column and the sentence above it if there is no hosted version today.
Do not describe one that is planned.

## Capabilities and keys

Everything in the first column works without a key unless the third column says otherwise.

| Capability | Key (optional) | Without it |
| --- | --- | --- |
| <capability> | `<ENV_VAR>` | works |
| <capability> | `<ENV_VAR>` | degraded: <what is worse, in one phrase> |
| <capability> | `<ENV_VAR>` | hidden |

TODO: copy these rows from the app's onboarding overlay, not from memory. When one changes,
change the other in the same commit. Never put a key value here, only its name.

## More

- Developer docs, architecture, benchmarks, runbooks: [`docs/`](docs/)
- Contributing: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- License: <license name> - see [`LICENSE`](LICENSE)

TODO: anything the old README had beyond the six sections above moves into `docs/` and gets a
link here.
