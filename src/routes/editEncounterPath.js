import { matchPath } from "react-router-dom";

export function editStepPath(pathname, nextPage) {
  const match = matchPath("/patients/:id/encounter/:encounterId/edit/*", pathname);
  if (!match) return nextPage;
  return match.pathnameBase + (nextPage === "/encounter" ? "" : nextPage);
}
