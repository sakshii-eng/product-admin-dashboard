import { Product } from "@/types/product";

const ADDED_PRODUCTS_KEY =
  "addedProducts";

const UPDATED_PRODUCTS_KEY =
  "updatedProducts";

const DELETED_PRODUCTS_KEY =
  "deletedProductIds";

export const getAddedProducts =
  (): Product[] => {
    if (typeof window === "undefined") {
      return [];
    }

    const data =
      localStorage.getItem(
        ADDED_PRODUCTS_KEY
      );

    return data
      ? JSON.parse(data)
      : [];
  };

export const getUpdatedProducts =
  (): Product[] => {
    if (typeof window === "undefined") {
      return [];
    }

    const data =
      localStorage.getItem(
        UPDATED_PRODUCTS_KEY
      );

    return data
      ? JSON.parse(data)
      : [];
  };

export const getDeletedProductIds =
  (): number[] => {
    if (typeof window === "undefined") {
      return [];
    }

    const data =
      localStorage.getItem(
        DELETED_PRODUCTS_KEY
      );

    return data
      ? JSON.parse(data)
      : [];
  };

export const saveAddedProduct = (
  product: Product
) => {
  const products =
    getAddedProducts();

  products.push(product);

  localStorage.setItem(
    ADDED_PRODUCTS_KEY,
    JSON.stringify(products)
  );
};

export const saveUpdatedProduct = (
  product: Product
) => {
  const products =
    getUpdatedProducts();

  const existingIndex =
    products.findIndex(
      (item) => item.id === product.id
    );

  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }

  localStorage.setItem(
    UPDATED_PRODUCTS_KEY,
    JSON.stringify(products)
  );
};

export const saveDeletedProductId = (
  id: number
) => {
  const ids =
    getDeletedProductIds();

  if (!ids.includes(id)) {
    ids.push(id);
  }

  localStorage.setItem(
    DELETED_PRODUCTS_KEY,
    JSON.stringify(ids)
  );
};