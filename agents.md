# AGENTS.md

When you need to call tools from the shell, use this rubric:

- Find files: `fd`
- Find text: `rg` (ripgrep)
- Find code structure (TS/TSX): `ast-grep`
  - Default to TypeScript:
    - `.ts` → `ast-grep --lang ts -p '<pattern>'`
    - `.tsx` (React) → `ast-grep --lang tsx -p '<pattern>'`
  - For other languages, set `--lang` appropriately (e.g., `--lang rust`).
- Select among matches: pipe to `fzf`
- JSON: `jq`
- YAML/XML: `yq`

## Quick examples

```bash
# Files
fd "router" app

# Text
rg -n "useLoaderData" app | fzf

# Code structure (TypeScript functions named loader)
ast-grep --lang ts -p 'function loader($$$)' app | fzf

# Code structure (TSX components using useFetcher)
ast-grep --lang tsx -p 'useFetcher($$$)' app | fzf

# JSON
jq '.scripts' package.json

# YAML
yq '.services[].image' docker-compose.yml
```

## Notes
- Prefer exact structure queries with `ast-grep` before falling back to `rg`.
- Combine `fd` + `rg` for speed: `rg pattern $(fd -e ts -e tsx app)`.
- Respect this project’s React Router v7 rules. If you see missing `./+types/[route]` imports, run `npm run typecheck`.

# AGENTS.md

When you need to call tools from the shell, use this rubric:

- Find files: `fd`
- Find text: `rg` (ripgrep)
- Find code structure (TS/TSX): `ast-grep`
  - Default to TypeScript:
    - `.ts` → `ast-grep --lang ts -p '<pattern>'`
    - `.tsx` (React) → `ast-grep --lang tsx -p '<pattern>'`
  - For other languages, set `--lang` appropriately (e.g., `--lang rust`).
- Select among matches: pipe to `fzf`
- JSON: `jq`
- YAML/XML: `yq`

## Quick examples

```bash
# Files
fd "router" app

# Text
rg -n "useLoaderData" app | fzf

# Code structure (TypeScript functions named loader)
ast-grep --lang ts -p 'function loader($$$)' app | fzf

# Code structure (TSX components using useFetcher)
ast-grep --lang tsx -p 'useFetcher($$$)' app | fzf

# JSON
jq '.scripts' package.json

# YAML
yq '.services[].image' docker-compose.yml
```

## Notes
- Prefer exact structure queries with `ast-grep` before falling back to `rg`.
- Combine `fd` + `rg` for speed: `rg pattern $(fd -e ts -e tsx app)`.
- Respect this project’s React Router v7 rules. If you see missing `./+types/[route]` imports, run `npm run typecheck`.
