import { AttachmentSubrecord, Creator, CreatorType, Item, NoteSubrecord } from "./zoteroTypes.ts"
import { cardinalConverter, CardinalDirection, degreeFromCardinal } from "https://esm.sh/cardinal-direction@1.1.1"

export const convert = (item: Item, isFlat: boolean): [string, string][] => {
  return [
    ["http://purl.org/dc/elements/1.1/title", item.title ? parseTitle(item.title)?.title || "Untitled" : "Untitled"],
    ["http://purl.org/dc/terms/alternative", item.title ? parseTitle(item.title)?.alternative || "" : ""],
    ["http://purl.org/dc/elements/1.1/date", item.date || ""],
    ["http://purl.org/dc/elements/1.1/language", item.language || ""],
    ["http://purl.org/dc/elements/1.1/identifier", item.url || ""],
    ["http://purl.org/dc/elements/1.1/rights", item.rights || ""],
    ...parseCreators(item.creators),
    // ["http://purl.org/dc/elements/1.1/description", item.abstractNote || ""],
    [
      "http://purl.org/dc/elements/1.1/source",
      parseSource(item.libraryCatalog, item.callNumber, item.archive, item.archiveLocation),
    ],
    [
      "http://purl.org/dc/elements/1.1/format",
      [item.artworkSize, item.scale, item.runningTime, item.medium].filter((n) => n).join(" "),
    ],
    ["http://purl.org/dc/elements/1.1/publisher", item.publisher || ""],
    [
      "http://purl.org/dc/terms/type",
      item.itemType == "artwork" || item.itemType == "map"
        ? "image"
        : item.itemType == "audioRecording"
        ? "sound"
        : "text",
    ],
    ...parseExtra(item.extra),
    ["https://tropy.org/v1/tropy#tag", item.tags.map((tag) => tag.tag).join(", ")],
    [
      "http://www.w3.org/2003/12/exif/ns#gpsImgDirection",
      parseAbstract(item.abstractNote).takenFacing?.toString() || "",
    ],
    ...parseAttachments(item.attachments, item.notes, item.abstractNote, isFlat),
  ]
}

const parseTitle = (rawTitle: string) => {
  const { title, alternative } = (/^(?:(?<title>[^\[]+))?(?:\[(?<alternative>.+)\])?$/gm.exec(rawTitle)?.groups ||
    {}) as {
    title?: string
    alternative?: string
  }
  if (!title) {
    if (alternative) {
      return { title: alternative }
    }
  } else {
    return { title, alternative }
  }
}

const parseCreator = (creator?: Creator): string | undefined => {
  if (!creator) return undefined
  return creator.firstName && creator.lastName
    ? `${creator.lastName}, ${creator.firstName}`
    : creator.firstName
    ? creator.firstName
    : creator.lastName
    ? creator.lastName
    : creator.name
    ? creator.name
    : undefined
}

const parseCreators = (
  creators?: Creator[]
): [["http://purl.org/dc/elements/1.1/creator", string], ["http://purl.org/dc/terms/contributor", string]] => {
  return [
    [
      "http://purl.org/dc/elements/1.1/creator",
      creators ? parseCreator(creators.find(({ creatorType: t }) => t !== CreatorType.Contributor)) || "" : "",
    ],
    [
      "http://purl.org/dc/terms/contributor",
      creators ? parseCreator(creators.find(({ creatorType: t }) => t === CreatorType.Contributor)) || "" : "",
    ],
  ]
}

const flattenPath = (path?: string) => {
  if (!path) return ""
  const sections = path.split("/")
  console.assert(sections.length === 3)
  return `files/${sections[1]}-${sections[2]}`
}

const parseAbstract = (abstract?: string): { description: string[]; takenFacing?: number } => {
  if (!abstract) return { description: [] }
  const lines = abstract.split("\n")
  const takenFacingRegex = /Taken facing the (?<direction>[^\.]+)/i
  const takenFacingLine = lines.find((line) => takenFacingRegex.test(line))
  const takenFacingParsed = takenFacingLine ? takenFacingRegex.exec(takenFacingLine)?.groups?.direction : null

  if (takenFacingParsed)
    console.log(
      takenFacingParsed,
      CardinalDirection[cardinalConverter(capitalizeFirstLetter(takenFacingParsed)) as keyof typeof CardinalDirection]
    )
  // Exclude taken facing lines

  return {
    description: lines.filter((line) => !takenFacingRegex.test(line)),
    takenFacing: takenFacingParsed
      ? degreeFromCardinal(
          CardinalDirection[
            cardinalConverter(capitalizeFirstLetter(takenFacingParsed)) as keyof typeof CardinalDirection
          ]
        )
      : undefined,
  }
}

const parseAttachments = (
  attachments?: AttachmentSubrecord[],
  notes: NoteSubrecord[] = [],
  abstract?: string,
  // deno-lint-ignore no-inferrable-types
  isFlat: boolean = true
): [string, string][] => {
  if (!attachments) return []
  return attachments
    .filter((a) => a.path)
    .flatMap((attachment, i) => [
      ["https://tropy.org/v1/tropy#path", `./${isFlat ? flattenPath(attachment.path) : attachment.path!}`],
      [
        "https://tropy.org/v1/tropy#note",
        i === 0
          ? [...parseAbstract(abstract).description, ...notes.map(({ note }) => note)].filter((n) => n).join(" --- ")
          : "",
      ],
    ])
}

const parseSource = (
  libraryCatalog?: string,
  callNumber?: string,
  archive?: string,
  archiveLocation?: string
): string => {
  const archiveString = [archive, archiveLocation].filter((n) => n).join(" ")
  const libraryCatalogString = [libraryCatalog, callNumber].filter((n) => n).join(" ")
  return [archiveString, libraryCatalogString].filter((n) => n).join(" ")
}

const parseExtraLine = (line: string) =>
  (/^(?:(?<field>[^\:]+)\: )?(?<content>.+)/.exec(line)?.groups || undefined) as
    | { field?: string; content: string }
    | undefined

const parseExtra = (
  extra?: string
): [["http://purl.org/dc/terms/isPartOf", string], ["http://purl.org/dc/elements/1.1/relation", string]] => {
  const lines: { field?: string; content: string }[] | undefined = extra
    ?.split("\n")
    .map(parseExtraLine)
    .filter((n) => n !== undefined) as { field?: string; content: string }[] | undefined
  return [
    ["http://purl.org/dc/terms/isPartOf", lines?.[0] && !lines[0].field ? lines[0].content : ""],
    [
      "http://purl.org/dc/elements/1.1/relation",
      lines ? (!lines[0].field ? lines.splice(1) : lines).map((line) => line.content).join(" --- ") : "",
    ],
  ]
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}