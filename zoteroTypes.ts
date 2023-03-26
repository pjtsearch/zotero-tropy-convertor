export interface ZoteroData {
  items: Item[]
}

export interface RecordBase {
  itemType: string
  tags: Tag[]
  relations: string[] | Record<string, any>
  dateAdded: Date
  dateModified: Date
  uri: string
}

export interface Item extends RecordBase {
  version: number
  title?: string
  accessDate?: Date
  itemID: number
  itemKey: string
  libraryID: number
  select: string
  collections?: Collection[]
  date?: string
  language?: string
  url?: string
  rights?: string
  creators?: Creator[]
  attachments?: AttachmentSubrecord[]
  notes?: NoteSubrecord[]
  citationKey?: string
  abstractNote?: string
  libraryCatalog?: string
  callNumber?: string
  extra?: string
  shortTitle?: string
  archive?: string
  archiveLocation?: string
  artworkSize?: string
  medium?: string
  runningTime?: string
  ISBN?: string
  place?: string
  volume?: string
  numberOfVolumes?: string
  publicationTitle?: string
  type?: string
  publisher?: string
  series?: string
  seriesNumber?: string
  edition?: string
  numPages?: string
  pages?: string
  journalAbbreviation?: string
  seriesTitle?: string
  seriesText?: string
  ISSN?: string
  DOI?: string
  issue?: string
  scale?: string
  section?: string
  note?: string
}

export interface AttachmentSubrecord extends RecordBase {
  itemType: "attachment"
  title: string
  uri: string
  path?: string
  select?: string
  version?: number
  url?: string
  accessDate?: Date
  parentItem?: string
  linkMode?: LinkMode
  contentType?: ContentType
  charset?: string
  itemID?: number
  itemKey?: string
  libraryID?: number
}

export interface NoteSubrecord extends RecordBase {
  itemType: "note"
  key: string
  version: number
  parentItem: string
  note: string
}

export type ContentType = string
export type Collection = string

export enum LinkMode {
  LinkedURL = "linked_url",
}

export interface Creator {
  firstName?: string
  lastName?: string
  creatorType: CreatorType
  name?: string
}

export enum CreatorType {
  Artist = "artist",
  Author = "author",
  Cartographer = "cartographer",
  Contributor = "contributor",
  Director = "director",
  Editor = "editor",
  Performer = "performer",
}

export interface Tag {
  tag: string
  type?: number
}
