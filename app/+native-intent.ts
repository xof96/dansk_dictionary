export const MAX_SYSTEM_PATH_LENGTH = 2_048;

function hasValidUriEncoding(path: string): boolean {
  try {
    decodeURIComponent(path);
    return true;
  } catch {
    return false;
  }
}

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  if (path.length > MAX_SYSTEM_PATH_LENGTH || !hasValidUriEncoding(path)) {
    return '/';
  }

  return path;
}
