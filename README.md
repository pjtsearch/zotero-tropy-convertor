# Zotero-Tropy Converter

Deno program that converts from BetterBibTex JSON into a Tropy compatible CSV.  It has some use-specific features, such as parsing the title into a original and translated title, and parsing the license and the rights holder.

## Usage

```bash
deno run --allow-read --allow-write ./index.ts input.json output.csv
```