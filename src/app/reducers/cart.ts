import * as Types from '../actions';
import { CartState, Product } from '../../utils/types';

const initialState: CartState = {
    items: [],
    collections: [],
    isLoading: false,
    error: null,
    totalPrice: '0.00',
    totalQuantity: 0,
};

export const cartReducer = (state = initialState, action: { type: string; payload?: any }): CartState => {
    switch (action.type) {
        case Types.GET_CART_REQUEST:
        case Types.ADD_TO_CART_REQUEST:
        case Types.UPDATE_CART_QTY_REQUEST:
        case Types.EDIT_CART_ITEM_REQUEST:
        case Types.REMOVE_FROM_CART_REQUEST:
        case Types.GET_COLLECTIONS_REQUEST:
        case Types.CREATE_COLLECTION_REQUEST:
        case Types.SWITCH_COLLECTION_REQUEST:
        case Types.DELETE_COLLECTION_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null
            };

        case Types.GET_CART_COMPLETED: {
            const rawData = action.payload.data;
            const cartData = rawData['member'] ? rawData['member'][0] : (rawData['hydra:member'] ? rawData['hydra:member'][0] : rawData);
            const cartItems = cartData.cartItems || cartData.items || [];
            const allProducts: Product[] = action.payload.products || [];
            const previousSelection = new Map(
                state.items.map((item) => [String(item.id), Boolean(item.selected)]),
            );

            // Map items to ensure we handle IRIs by looking up the full product from the store
            const mappedItems = cartItems.map((item: any) => {
                let productData = item.product;
                
                const resolveFromCatalog = (ref: string | number) =>
                    allProducts.find(
                        (p) =>
                            p['@id'] === ref ||
                            `/api/products/${p.id}` === ref ||
                            p.id === ref ||
                            String(p.id) === String(ref),
                    );

                // If product is an IRI string, or embedded without full fields, enrich from catalog
                if (typeof productData === 'string') {
                    const foundProduct = resolveFromCatalog(productData);
                    if (foundProduct) {
                        productData = foundProduct;
                    }
                } else if (productData?.id) {
                    const foundProduct = resolveFromCatalog(productData.id);
                    if (foundProduct) {
                        productData = { ...foundProduct, ...productData };
                    }
                }

                const itemId = String(item.id);
                const selected = previousSelection.has(itemId)
                    ? previousSelection.get(itemId)!
                    : item.selected === true;

                return {
                    ...item,
                    product: productData,
                    selected,
                };
            });

            return {
                ...state,
                isLoading: false,
                items: mappedItems,
                totalPrice: cartData.totalPrice || '0.00',
                totalQuantity: cartData.totalQuantity || 0,
            };
        }

        case Types.GET_COLLECTIONS_COMPLETED:
            return {
                ...state,
                isLoading: false,
                collections: action.payload['member'] || action.payload['hydra:member'] || action.payload || [],
            };

        case Types.ADD_TO_CART_COMPLETED:
        case Types.UPDATE_CART_QTY_COMPLETED:
        case Types.EDIT_CART_ITEM_COMPLETED:
        case Types.REMOVE_FROM_CART_COMPLETED:
        case Types.CREATE_COLLECTION_COMPLETED:
        case Types.SWITCH_COLLECTION_COMPLETED:
        case Types.DELETE_COLLECTION_COMPLETED:
            return {
                ...state,
                isLoading: false,
                error: null
            };

        case Types.GET_CART_ERROR:
        case Types.ADD_TO_CART_ERROR:
        case Types.UPDATE_CART_QTY_ERROR:
        case Types.EDIT_CART_ITEM_ERROR:
        case Types.REMOVE_FROM_CART_ERROR:
        case Types.GET_COLLECTIONS_ERROR:
        case Types.CREATE_COLLECTION_ERROR:
        case Types.SWITCH_COLLECTION_ERROR:
        case Types.DELETE_COLLECTION_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.payload
            };

        case Types.TOGGLE_CART_ITEM_SELECTION:
            return {
                ...state,
                items: state.items.map(item =>
                    String(item.id) === String(action.payload)
                        ? { ...item, selected: !Boolean(item.selected) }
                        : item
                ),
            };

        case Types.SET_CART_ITEMS_SELECTION: {
            const { selected, itemIds } = action.payload as {
                selected: boolean;
                itemIds?: (string | number)[];
            };
            const idSet = itemIds?.length
                ? new Set(itemIds.map((id) => String(id)))
                : null;

            return {
                ...state,
                items: state.items.map((item) =>
                    !idSet || idSet.has(String(item.id))
                        ? { ...item, selected }
                        : item,
                ),
            };
        }

        case Types.CLEAR_CART:
            return initialState;

        case Types.REMOVE_PURCHASED_CART_ITEMS: {
            const purchasedIds = new Set(
                (action.payload as (string | number)[]).map((id) => String(id)),
            );
            const remainingItems = state.items.filter(
                (item) => item.id != null && !purchasedIds.has(String(item.id)),
            );
            const totalQuantity = remainingItems.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0,
            );
            const totalPrice = remainingItems
                .reduce(
                    (sum, item) => sum + parseFloat(item.price || '0') * (item.quantity || 0),
                    0,
                )
                .toFixed(2);

            return {
                ...state,
                items: remainingItems,
                totalQuantity,
                totalPrice,
            };
        }

        default:
            return state;
    }
};

// Action creators
export const getCart = () => ({
    type: Types.GET_CART
});

export const getCollections = () => ({
    type: Types.GET_COLLECTIONS
});

export const createCollection = (name: string) => ({
    type: Types.CREATE_COLLECTION,
    payload: name
});

export const switchCollection = (cartId: string | number) => ({
    type: Types.SWITCH_COLLECTION,
    payload: cartId
});

export const deleteCollection = (cartId: string | number) => ({
    type: Types.DELETE_COLLECTION,
    payload: cartId
});

export const addToCart = (productId: string | number, quantity: number = 1) => ({
    type: Types.ADD_TO_CART,
    payload: { productId, quantity }
});

export const removeFromCart = (cartItemId: string | number) => ({
    type: Types.REMOVE_FROM_CART,
    payload: cartItemId
});

export const updateCartQty = (cartItemId: string | number, quantity: number) => ({
    type: Types.UPDATE_CART_QTY,
    payload: { cartItemId, quantity }
});

export const editCartItem = (payload: {
    cartItemId: string | number;
    quantity: number;
    size: string;
    color: string;
}) => ({
    type: Types.EDIT_CART_ITEM,
    payload,
});

export const toggleCartItemSelection = (id: string | number) => ({
    type: Types.TOGGLE_CART_ITEM_SELECTION,
    payload: id
});

export const setCartItemsSelection = (
    selected: boolean,
    itemIds?: (string | number)[],
) => ({
    type: Types.SET_CART_ITEMS_SELECTION,
    payload: { selected, itemIds },
});

export const clearCart = () => ({
    type: Types.CLEAR_CART
});
