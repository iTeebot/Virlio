# Feed Ranking Algorithms Architecture

## Overview
Virlio employs multiple modular ranking algorithms to score, order, and personalize feed content across global scale.

## Ranking Algorithms

### 1. Wilson Score Lower Bound (Confidence Score)
Used for sorting community favorites and top memes based on positive action ratios:
$$\hat{p} + \frac{z_{\alpha/2}^2}{2n} \pm z_{\alpha/2} \sqrt{\frac{\hat{p}(1-\hat{p})}{n} + \frac{z_{\alpha/2}^2}{4n^2}} / \left(1 + \frac{z_{\alpha/2}^2}{n}\right)$$

### 2. Exponential Gravity Decay Ranking (Hot & Trending)
Calculates velocity decay over time $T$ (hours since creation):
$$\text{Score} = \frac{\text{Upvotes} + 2 \times \text{Bookmarks} + 3 \times \text{Shares} - \text{Reports}}{(T + 2)^G}$$
where $G = 1.8$ gravity exponent.

### 3. Personalized Vector Similarity (AI Feed)
Cosine similarity between user embedding vector $U$ (based on past liked categories and industry interactions) and meme embedding vector $M$:
$$\text{Similarity}(U, M) = \frac{U \cdot M}{\|U\| \|M\|}$$

### 4. Community & Reputation Score
Applies weighting based on the author's verified status and contributor level:
$$\text{FinalScore} = \text{BaseScore} \times (1.0 + \text{AuthorLevel} \times 0.1) \times (\text{IsVerifiedBrand} ? 1.25 : 1.0)$$

### 5. Multi-Bucket Hybrid Ranking
Feeds mix content using deterministic slot allocation:
- **Bucket 0 (Top 20%)**: High-confidence Wilson Score memes.
- **Bucket 1 (Next 40%)**: High-decay velocity trending memes.
- **Bucket 2 (Next 30%)**: AI personalized recommendations.
- **Bucket 3 (Bottom 10%)**: Fresh unexplored submissions (Exploration/Exploitation).
