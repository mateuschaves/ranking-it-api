class ImageUtil {
  public static getExtension(mimetype: string) {
    return mimetype.split('/')[1];
  }
}

export default ImageUtil;
