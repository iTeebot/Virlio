import { DiscoveredFacebookPage } from "./facebook-oauth.service";

const globalForPages = globalThis as unknown as {
  discoveredPagesStore: Map<string, DiscoveredFacebookPage[]>;
};

export const discoveredPagesStore =
  globalForPages.discoveredPagesStore ?? new Map<string, DiscoveredFacebookPage[]>();

if (process.env.NODE_ENV !== "production") globalForPages.discoveredPagesStore = discoveredPagesStore;
