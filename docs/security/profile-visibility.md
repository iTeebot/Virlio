# Profile & Data Visibility Architecture

## Overview
Virlio provides granular privacy settings for user profiles, brand portfolios, and contribution feeds.

## Visibility Levels
- `PUBLIC`: Accessible to search engine crawlers and all unauthenticated visitors.
- `COMMUNITY_ONLY`: Visible only to registered Virlio users.
- `BRAND_ONLY`: Visible only to team members of the verified brand.
- `PRIVATE`: Visible exclusively to the account owner.

## Configurable Visibility Matrix
- **Public Profile & Handle**: PUBLIC by default.
- **Earned Badges & Streaks**: PUBLIC by default (toggleable).
- **Activity Calendar**: PUBLIC by default (toggleable).
- **Published Memes**: PUBLIC or PRIVATE per meme asset.
- **Brand Analytics & Lead Data**: PRIVATE to brand admins.
