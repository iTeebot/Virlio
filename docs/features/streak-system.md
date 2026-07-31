# User Streak System Architecture

## Overview
The Virlio User Streak System incentivizes consistent daily engagement across multiple activity categories. Streaks increase public profile visibility, contribution rank, and XP rewards.

## Streak Categories (Extensible Framework)
1. **Daily Login**: Logging into the platform.
2. **Daily Meme Generation**: Generating at least 1 meme.
3. **Daily Template Upload**: Submitting a new template to the community.
4. **Daily Contribution**: Voting, commenting, or reporting content.
5. **Daily Brand Activity**: Publishing or scheduling brand content.
6. **Daily Learning & Guidelines**: Reviewing brand documentation or guides.

## Streak Logic & Window Evaluation
- **Evaluation Window**: 24-hour UTC day boundary (`00:00:00 UTC` to `23:59:59 UTC`).
- **Streak Increment**: Triggered on first qualifying action within UTC day window.
- **Grace Period & Streak Freeze**: Configurable 24-hour streak freeze item for missed days without resetting lifetime records.
- **Streak Break**: Missed activity without freeze resets `currentStreak` to 1 while preserving `longestStreak`.

## Milestone XP Rewards
- **7 Days**: 500 XP + "Consistent Creator" Badge
- **30 Days**: 2,500 XP + "Month Streak Master" Badge
- **100 Days**: 10,000 XP + "Century Club" Badge
- **365 Days**: 50,000 XP + "Year of Virality" Hall of Fame Status
