export interface CategoryItem {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  count?: number;
}

export interface TemplateFilterState {
  categories: string[]; // Selected category slugs
  // Prepared structure for future filter criteria without requiring UI redesign
  subcategory?: string;
  language?: string;
  country?: string;
  tags?: string[];
  sort?: "popular" | "newest" | "downloads";
  contributor?: string;
}

export const DEFAULT_FILTER_STATE: TemplateFilterState = {
  categories: [],
};
