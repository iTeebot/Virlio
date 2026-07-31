# Public Profiles Architecture & Handle Specification

## Executive Overview
Public profiles establish identity, credibility, and gamified reputation across the Virlio network. Every user handle operates as a unique public URL (`/profiles/[username]`).

## Profile Data Architecture
- **Identity Attributes**: Username, Display Name, Bio, Avatar, Verification Badges, Joined Date.
- **Streak & Consistency Metrics**: Current Streak Days, Longest Streak Days, Total Active Days, Consistency Index Score.
- **Gamification Level & XP**: Level Number, Current Level XP, XP to Next Level, Contribution Rank.
- **Earned Badge Array**: List of unlocked achievement badge objects with graphics and timestamps.
- **Activity Calendar Matrix**: GitHub-style 365-day activity grid storing daily contribution intensity.
- **Social Graph Counts**: Followers Count, Following Count.
- **Content Portfolios**: Published Memes, Uploaded Templates, Featured Assets.

## Username Handle Rules
- Case-insensitive unique handle constraint (`@username`).
- 3 to 30 alphanumeric characters and underscores (`^[a-zA-Z0-9_]{3,30}$`).
- Immutable URL mapping with permalink redirection support.
