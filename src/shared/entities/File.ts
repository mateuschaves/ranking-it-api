export enum AclEnum {
  PUBLIC = 'public-read',
  PRIVATE = 'private',
}
export class IFile {
  id: string;
  name: string;
  url: string;
  path: string;
  mimetype: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
