export { ROUTES } from './routes';
export { isValidEmail } from './validation';
export {
  PASSWORD_MIN_LENGTH,
  validatePasswordMatch,
  validatePasswordStrength,
} from './passwordValidation';
export { getApiErrorMessage } from './apiErrorMessage';
export { searchProducts } from './search';
export {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from './recentSearch';
export {
  applyCatalogSort,
  CATALOG_SORT_OPTIONS,
  sortProductsByName,
  sortProductsByPriceAsc,
} from './catalog';
export type { CatalogSortOption } from './catalog';
export {
  DISCOVER_CATEGORY,
  filterProductsByCategory,
  getCategoryPreviewImage,
  getProductCategoryId,
  getProductSubCategory,
  sortProductsByNewest,
  sortProductsByPriceDesc,
} from './home';
export { default as IMG } from './image';
export { SURFACE_CARD_CLASS, surfaceCardShadow, mergeSurfaceCardStyle } from './cardStyles';
export { themeColors, themeNativeShadows, getThemeColor, surfaceCardShadowStyle } from '../theme';
export {
  formatFetchErrorMessage,
  pickPrimaryFetchError,
  shouldShowFetchError,
} from './fetchError';
export {
  classifyAppError,
  getErrorMessage,
  getErrorPresentation,
} from './errorPresentation';
export type { AppErrorKind, ErrorPresentation, ErrorPresentationOptions } from './errorPresentation';
export {
  resolveResourceIri,
  resolveResourceId,
  resolveCustomerEndpoint,
  getEmbeddedCustomer,
  getCustomerRefFromUser,
} from './apiResource';