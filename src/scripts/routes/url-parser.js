function splitSegments(path) {
  const parts = path.split('/');
  return {
    resource: parts[1] || null,
    id: parts[2] || null,
  };
}

function buildRouteFrom(parts) {
  let out = '';
  if (parts.resource) out = out.concat(`/${parts.resource}`);
  if (parts.id) out = out.concat('/:id');
  return out || '/';
}

export function getHashPath() {
  return location.hash.replace('#', '') || '/';
}

export function resolveRoute() {
  const pathname = getHashPath();
  const seg = splitSegments(pathname);
  return buildRouteFrom(seg);
}

export function parseHash() {
  const pathname = getHashPath();
  return splitSegments(pathname);
}

export function getRoute(pathname) {
  const seg = splitSegments(pathname);
  return buildRouteFrom(seg);
}

export function parsePathname(pathname) {
  return splitSegments(pathname);
}
