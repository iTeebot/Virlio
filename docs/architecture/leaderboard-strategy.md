# Multi-Dimensional Leaderboard Architecture

## Overview
Virlio extends the traditional static leaderboard into a multi-dimensional ranking engine spanning 20+ real-time indices.

## Leaderboard Indices
1. **Longest Current Streak**: Users with highest active consecutive day streaks.
2. **Longest Lifetime Streak**: Historical streak day record holders.
3. **Most Memes Generated**: Total meme creation volume.
4. **Most Templates Uploaded**: Total template submission count.
5. **Most Approved Templates**: Moderation-approved template contributions.
6. **Highest Contributor Score**: Weighted score based on downloads and upvotes.
7. **Most Likes Received**: Aggregate likes across all authored memes.
8. **Most Bookmarks**: Aggregate bookmarks across all authored memes.
9. **Most Viewed Memes**: Cumulative view impressions.
10. **Most Shared Memes**: Viral share counts.
11. **Top Verified Brands**: Highest engagement verified business profiles.
12. **Top Contributors**: Top community template authors.
13. **Top Countries**: Most active geographic regions.
14. **Top Industries**: High-growth business verticals.
15. **Top Categories & Subcategories**: Popular meme categories.
16. **Top Languages**: Most generated meme languages.
17. **Top Templates**: Highest utilized template assets.
18. **Top Rising Brands**: Fastest 7-day velocity business profiles.
19. **Top Rising Contributors**: Fastest 7-day velocity creators.
20. **Top New Contributors**: High-performing accounts joined in last 30 days.

## Index Update Strategy
- **Real-Time Indices (Redis Sorted Sets)**: Daily/Weekly streaks, upvotes, views.
- **Batch Aggregations (Nightly Cron)**: Lifetime streaks, country rankings, industry distribution.
