# Mathematical Formulations for Ranking & Recommendation Engine

## Algorithmic Specifications

### 1. Hot Velocity Formula (Sliding Window)
$$V = \frac{L + 2B + 3S}{(T + 2)^{1.5}}$$
where:
- $L$ = Like Count
- $B$ = Bookmark Count
- $S$ = Share Count
- $T$ = Hours elapsed since publish

### 2. Contributor Reputation Index
$$R = (\text{ApprovedTemplates} \times 10) + (\text{Upvotes} \times 0.5) + (\text{ActiveStreakDays} \times 5)$$

### 3. Vector Similarity Recommendation (AI Feed)
$$S(i, j) = \frac{\mathbf{v}_i \cdot \mathbf{v}_j}{\|\mathbf{v}_i\| \|\mathbf{v}_j\|}$$
where $\mathbf{v}_i$ represents user interaction vector and $\mathbf{v}_j$ represents meme attribute embedding.
