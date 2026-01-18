export interface PaginatedResponseDto<T> {
  items: T[];
  hasMore: boolean;
  nextStartPosition?: number;
}
