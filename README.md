# Moffitt Claude Code mods

The Claude Code mods approved for Moffitt, as a plugin marketplace named `moffitt-mods`.
Each folder under `plugins/` is a complete plugin, copied from Anthropic's
[claude-code-playground](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods)
samples. `blast-radius` is changed to work on Windows; the other two are unchanged. See
`NOTICE` for the source commit and the change.

| Mod | What it does |
| --- | --- |
| `token-weather` | Draws a live forecast of the context window above the prompt. |
| `replay-theater` | Adds `/replay`, which steps through the file edits Claude made in the last turn. |
| `blast-radius` | Holds a risky shell command (`rm -rf`, `git reset --hard`, a force push) and shows what it would change, with Proceed and Cancel buttons. |

Mods need Claude Code 2.1.287 or later (the Desktop app's Code tab: 2.1.286 or later).
They work in the terminal, the Desktop app's Code tab and VS Code, not in chat or Cowork.

`blast-radius` shows its buttons only in a terminal session. In the Desktop app's Code tab
nothing can draw them, so it refuses the risky command at once and says what it would
have changed; run that command yourself if you still want it.

## MoffittCorp Team members

Nothing to do. The MoffittCorp organization's Claude Code managed settings register this
marketplace and turn the approved mods on when you sign in to Claude Code with your
MoffittCorp account.

## Anyone else (for example a personal Max account)

Run these in a terminal, then start a new Claude Code session (or run `/reload-plugins`):

```bash
claude plugin marketplace add Moffitt-Ventilation-Solutions/claude-code-mods
claude plugin install token-weather@moffitt-mods
claude plugin install replay-theater@moffitt-mods
claude plugin install blast-radius@moffitt-mods
```

To check, run `claude plugin list`: each mod shows `Status: enabled`.

## Adding or changing a mod

Review it first with `claude plugin validate plugins/<name>` and read the `hooks:` and
`calls:` lines. Raise the plugin's `version` in its `plugin.json` with every change, or
installed copies keep the old version.
