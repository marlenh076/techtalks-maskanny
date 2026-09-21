export interface ISearchRepository<T, F> {
  search(filters: F): Promise<T[]>;
}
