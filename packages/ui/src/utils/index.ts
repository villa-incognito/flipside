export function optimizeCloudinaryImage(url: string | null | undefined, width: number) {
  if (url?.includes("cloudinary")) {
    let replacement = `w_${width},f_auto`;
    if (url.includes(".gif")) {
      replacement = `${replacement},fl_lossy`;
    }
    return url.replace("upload/", `upload/${replacement}/`);
  }
  return url;
}
