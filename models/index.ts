// Barrel: importing this module registers all Mongoose schemas on the default
// connection, so anywhere that calls connect() afterwards finds them.
// Server Components / Server Actions import "@/models" once for side effects.

import "./Genre";
import "./Tag";
import "./Manga";
import "./Chapter";
import "./User";
import "./Settings";

export { Genre, type GenreDoc } from "./Genre";
export { Tag, type TagDoc } from "./Tag";
export { Manga, type MangaDoc } from "./Manga";
export { Chapter, type ChapterDoc } from "./Chapter";
export { User, type UserDoc } from "./User";
export { Settings, type SettingsDoc } from "./Settings";
