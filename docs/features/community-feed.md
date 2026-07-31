# Community Feed Architecture & System Specification

## Executive Overview
The Virlio Community Feed is a core discovery platform where users discover high-quality marketing memes, verified brand content, and community templates. It combines elements of GitHub Explore, Dribbble, Reddit, Behance, and LinkedIn Feed into a brand-focused discovery experience.

## Feed Sources
1. **Public Brand Memes**: Memes generated and published by verified business profiles.
2. **Featured Memes**: Editor-curated and high-performing marketing content.
3. **Trending Memes**: Rapidly velocity-scoring memes evaluated over sliding 1-hour and 24-hour windows.
4. **Newest Memes**: Real-time reverse-chronological feed stream.
5. **Editor's Picks**: Hand-selected memes with high viral design score.
6. **Community Favorites**: Memes with highest bookmark-to-view ratios.
7. **AI Recommended Memes**: Personalized vectors matching user history and industry preferences.
8. **Popular & Approved Templates**: Newly approved and viral community templates.
9. **Top Contributors & Rising Brands**: Featured brand profiles and contributor highlights.
10. **Regional & Language Feeds**: Country-specific (e.g. Pakistan, UAE, Global) and language-segmented feeds.

## Feed Card Data Schema
Each meme card payload contains:
- `id`: Unique string
- `memeUrl`: High-res rendered asset URL
- `brand`: Verified brand profile metadata (slug, name, logo, industry, verificationBadge)
- `template`: Source template metadata (id, title, contributorHandle)
- `caption`: Generated text caption
- `hashtags`: Array of strings
- `generatedAt`: ISO 8601 timestamp
- `category`: Primary business vertical
- `subcategory`: Specific domain classification
- `tags`: Array of taxonomy tags
- `metrics`: Likes, Bookmarks, Shares, Views, Comments, CopyCaptionCount
- `trendScore`: Float calculated by ranking pipeline
- `aiQualityScore`: Optional quality rating float (0.00 - 1.00)

## Feed Actions Protocol
- `LIKE_MEME` / `UNLIKE_MEME`
- `BOOKMARK_MEME` / `UNBOOKMARK_MEME`
- `SHARE_MEME` (Generates trackable viral share links)
- `COPY_CAPTION` / `COPY_HASHTAGS`
- `VIEW_BRAND` / `VIEW_TEMPLATE` / `VIEW_CONTRIBUTOR`
- `GENERATE_SIMILAR_MEME` (Prefills generator with template and brand voice)
- `REPORT_MEME` / `HIDE_MEME`
- `FOLLOW_BRAND` / `FOLLOW_CONTRIBUTOR`
