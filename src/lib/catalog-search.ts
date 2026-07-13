export type SearchableCatalogItem = {
  searchText: string;
};

export function normalizeCatalogText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesCatalogQuery(
  item: SearchableCatalogItem,
  query: string
) {
  const tokens = normalizeCatalogText(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = normalizeCatalogText(item.searchText);
  return tokens.every((token) => haystack.includes(token));
}
