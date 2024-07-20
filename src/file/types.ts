export enum FileType {
  Avatar,
  Image,
  Video,
  File,
}
export interface SaveFileOptions {
  filetype: FileType;
}
