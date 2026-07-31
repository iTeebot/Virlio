# Public Content SEO Strategy & Dynamic Indexation

## Executive Overview
The Virlio Community Feed and public profiles act as an organic acquisition engine by exposing indexable, search-engine-optimized pages.

## Dynamic Route Strategy
- `/feed`: Core public feed directory.
- `/discover`: High-intent taxonomy explore page.
- `/public-profiles`: Directory of top creators and brand accounts.
- `/public-brands`: Verified business directory.
- `/public-memes`: Individual public meme Permalinks with `SocialMediaPosting` JSON-LD schema.
- `/public-templates`: Meme template directory with `CreativeWork` JSON-LD schema.
- `/public-contributors`: Top creator hall of fame.

## Indexation & Sitemap Rules
- Dynamic XML Sitemaps generated at `/sitemap.xml` listing updated public memes, profiles, and templates.
- Canonical tag enforcement on all paginated archive pages (`/feed?page=2`).
- OpenGraph & Twitter Card metatags generated server-side for viral preview rendering.
