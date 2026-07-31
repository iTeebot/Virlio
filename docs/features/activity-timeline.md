# Activity Timeline & Event Bus Architecture

## Overview
The Activity Timeline records and displays chronological user interactions, content milestones, and streak achievements across public user profiles and brand dashboards.

## Event Schema Specification
Each activity event object adheres to:
- `id`: Event UUID
- `userId`: Target user ID
- `type`: EventType enum
- `timestamp`: UTC Timestamp
- `payload`: JSON Metadata
- `visibility`: "PUBLIC" | "UNLISTED" | "PRIVATE"

## Supported Event Types
1. `USER_JOINED`: Joined Virlio platform.
2. `BRAND_VERIFIED`: Brand profile achieved verified status.
3. `TEMPLATE_UPLOADED`: Submitted a new template.
4. `TEMPLATE_APPROVED`: Template passed moderation.
5. `MEME_GENERATED`: Created a new brand meme.
6. `ACHIEVEMENT_EARNED`: Unlocked achievement badge.
7. `STREAK_MILESTONE`: Reached 7/30/100/365 day streak.
8. `LEVEL_UP`: Achieved next gamification level.
9. `MEME_FEATURED`: Content selected for Editor's Pick.
10. `MEME_TRENDING`: Content entered top trending feed.
