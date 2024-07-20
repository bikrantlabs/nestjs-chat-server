import { BadRequestException, Injectable } from '@nestjs/common';
import { extname, join } from 'path';
import { promises as fsPromises } from 'fs';
import { FileType, SaveFileOptions } from './types';
@Injectable()
export class FileService {
  constructor() {}
  private static readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];

  static fileFilter(
    req: any,
    file: Express.Multer.File,
    callback: (error: Error, acceptFile: boolean) => void,
  ) {
    if (!FileService.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      return callback(new BadRequestException('File type not allowed'), false);
    }
    return callback(null, true);
  }

  fileName(file: Express.Multer.File): string {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtName = extname(file.originalname);
    const _fileName = `${file.fieldname}-${uniqueSuffix}${fileExtName}`;
    return _fileName;
  }
  async saveFile(file: Express.Multer.File, opts: SaveFileOptions) {
    const saveLocation = this.getFileSaveLocation(opts.filetype);
    const uploadDir = join(
      __dirname,
      '..',
      '..',
      'public',
      'uploads',
      saveLocation,
    );
    const fileName = this.fileName(file);
    const uploadPath = join(uploadDir, fileName);

    // Ensure the upload directory exists
    await fsPromises.mkdir(uploadDir, { recursive: true });
    // Save the file
    await fsPromises.writeFile(uploadPath, file.buffer);
    const fileUrl = `/public/uploads/${saveLocation}/${fileName}`;
    return fileUrl;
  }

  getFileSaveLocation(fileType: FileType): string {
    if (fileType === FileType.Avatar) return 'avatars';
    else if (fileType === FileType.Image) return 'private/images';
    else if (fileType === FileType.Video) return 'private/videos';
    else return 'private/files';
  }
}
