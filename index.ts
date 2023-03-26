import { convert } from "./convert.ts"
import { ZoteroData } from "./zoteroTypes.ts"
import { writeCSV } from "https://deno.land/x/csv/mod.ts"

const IS_FLAT = true

const decoder = new TextDecoder("utf-8")

const input: ZoteroData = JSON.parse(decoder.decode(await Deno.readFile(Deno.args[0])))
const items = input.items.map((item) => convert(item, IS_FLAT))
const maxLengthItem = items.reduce((a, b) => (a.length > b.length ? a : b))
const csvItems = [maxLengthItem.map((pair) => pair[0]), ...items.map((item) => item.map((pair) => pair[1]))]
const output = await Deno.open(Deno.args[1], {
  write: true,
  create: true,
  truncate: true,
})

await writeCSV(output, csvItems, { forceQuotes: true })

output.close()
