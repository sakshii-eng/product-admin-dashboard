"use client";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
  deleteProduct,
} from "@/services/productService";

import { Product } from "@/types/product";

import {
  getAddedProducts,
  getUpdatedProducts,
  getDeletedProductIds,
  saveDeletedProductId,
} from "@/services/localProductService";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search
  const searchFromUrl =
    searchParams.get("search") || "";

  const [searchInput, setSearchInput] =
    useState(searchFromUrl);

  // Used to cancel old API requests
  const abortControllerRef =
    useRef<AbortController | null>(null);

  // Used to prevent old results from replacing new results
  const requestIdRef = useRef(0);

  const [categories, setCategories] =
  useState<string[]>([]);

const categoryFromUrl =
  searchParams.get("category") || "";

const sortFromUrl =
  searchParams.get("sort") || "";

  let sortBy = "";
let order = "";

if (sortFromUrl === "price-asc") {
  sortBy = "price";
  order = "asc";
}

if (sortFromUrl === "price-desc") {
  sortBy = "price";
  order = "desc";
}

if (sortFromUrl === "rating-desc") {
  sortBy = "rating";
  order = "desc";
}

if (sortFromUrl === "title-asc") {
  sortBy = "title";
  order = "asc";
}

  // Pagination values from URL
  const pageFromUrl =
    Number(searchParams.get("page"));

  const pageSizeFromUrl =
    Number(searchParams.get("pageSize"));

  const page =
    Number.isInteger(pageFromUrl) &&
    pageFromUrl >= 1
      ? pageFromUrl
      : 1;

  const pageSize =
    [10, 20, 50].includes(pageSizeFromUrl)
      ? pageSizeFromUrl
      : 10;

  const skip =
    (page - 1) * pageSize;

  const totalPages =
    Math.ceil(total / pageSize);

  // Check login and load products
  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    loadProducts();
  }, [
  router,
  page,
  pageSize,
  searchFromUrl,
  categoryFromUrl,
  sortFromUrl,
]);

  // Search debounce
// Search debounce
useEffect(() => {
  const timer = setTimeout(() => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (searchInput.trim()) {
      params.set(
        "search",
        searchInput.trim()
      );
    } else {
      params.delete("search");
    }

    // Search always starts from page 1
    params.set("page", "1");

    router.push(
      `/products?${params.toString()}`
    );
  }, 500);

  return () => {
    clearTimeout(timer);
  };
}, [searchInput]);


// Load categories
useEffect(() => {
  const loadCategories = async () => {
    try {
      const data = await getCategories();

      const categoryNames = data.map(
        (item: any) =>
          typeof item === "string"
            ? item
            : item.slug
      );

      setCategories(categoryNames);
    } catch (error) {
      console.error(
        "Failed to load categories"
      );
    }
  };

  loadCategories();
}, []);

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;

      // Give this request a unique number
      const currentRequestId =
        ++requestIdRef.current;

      let data: {
  products: Product[];
  total: number;
};

      // If search exists
      if (searchFromUrl) {
  data = await searchProducts(
  searchFromUrl,
  pageSize,
  skip,
  controller.signal,
  sortBy,
  order
);
} else if (categoryFromUrl) {
  data = await getProductsByCategory(
  categoryFromUrl,
  pageSize,
  skip,
  controller.signal,
  sortBy,
  order
);
} else {
 data = await getProducts(
  pageSize,
  skip,
  controller.signal,
  sortBy,
  order
);
}

      // Ignore old request results
      if (
        currentRequestId !==
        requestIdRef.current
      ) {
        return;
      }



const addedProducts =
  getAddedProducts();

const updatedProducts =
  getUpdatedProducts();

const deletedProductIds =
  getDeletedProductIds();

const updatedProductsMap =
  new Map(
    updatedProducts.map(
      (product) => [product.id, product]
    )
  );

let finalProducts: Product[] = data.products
  .map((product: Product) => {
    return updatedProductsMap.get(product.id) || product;
  })
  .filter((product: Product) => {
    return !deletedProductIds.includes(product.id);
  });

if (
  !searchFromUrl &&
  !categoryFromUrl &&
  page === 1
) {
  finalProducts = [
    ...addedProducts,
    ...finalProducts,
  ];
}

const maxPage = Math.max(
  1,
  Math.ceil(
    (data.total +
      addedProducts.length -
      deletedProductIds.length) /
      pageSize
  )
);

if (page > maxPage) {
  const params =
    new URLSearchParams(
      searchParams.toString()
    );

  params.set(
    "page",
    maxPage.toString()
  );

  router.replace(
    `/products?${params.toString()}`
  );

  return;
}

setProducts(finalProducts);

const deletedCount =
  deletedProductIds.length;

const addedCount =
  addedProducts.length;

setTotal(
  Math.max(
    0,
    data.total +
      addedCount -
      deletedCount
  )
);

    } catch (error: any) {
      // Ignore cancelled requests
      if (
        error.name === "CanceledError" ||
        error.name === "AbortError"
      ) {
        return;
      }

      setError(
        "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  // Change page
  const changePage = (
    newPage: number
  ) => {
    if (
      newPage < 1 ||
      newPage > totalPages
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set(
      "page",
      newPage.toString()
    );

    params.set(
      "pageSize",
      pageSize.toString()
    );

    router.push(
      `/products?${params.toString()}`
    );
  };

  // Change page size
  const changePageSize = (
    newPageSize: number
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set("page", "1");

    params.set(
      "pageSize",
      newPageSize.toString()
    );

    router.push(
      `/products?${params.toString()}`
    );
  };


  const handleDelete = async (
  id: number
) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteProduct(id.toString());

    saveDeletedProductId(id);

    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) => product.id !== id
      )
    );

    setTotal((currentTotal) =>
      Math.max(0, currentTotal - 1)
    );

    alert("Product deleted successfully!");
  } catch (error) {
    alert("Failed to delete product");
  }
};

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");

    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-black text-white p-4 flex justify-between items-center">

        <h1 className="text-xl font-bold">
          Product Admin Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Logout
        </button>

      </nav>

      {/* Main content */}
      <main className="p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">

  <div>

    <div className="flex items-center gap-4">

  <h2 className="text-3xl font-bold">
    Products
  </h2>

  <button
    onClick={() =>
      router.push("/products/add")
    }
    className="bg-black text-white px-4 py-2 rounded"
  >
    + Add Product
  </button>

</div>

    {/* Search */}
    <input
      type="text"
      value={searchInput}
      onChange={(e) =>
        setSearchInput(e.target.value)
      }
      placeholder="Search products..."
      className="border rounded px-4 py-2 mt-3 w-72"
    />

  </div>

  {/* Filters */}
  <div className="flex items-center gap-4">

    {/* Category */}
    <div className="flex items-center gap-2">

      <label>
        Category:
      </label>

      <select
        value={categoryFromUrl}
        onChange={(e) => {
          const params =
            new URLSearchParams(
              searchParams.toString()
            );

          if (e.target.value) {
            params.set(
              "category",
              e.target.value
            );
          } else {
            params.delete("category");
          }

          params.set("page", "1");

          router.push(
            `/products?${params.toString()}`
          );
        }}
        className="border rounded px-3 py-2 bg-white"
      >

        <option value="">
          All Categories
        </option>

        {categories.map(
          (category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          )
        )}

      </select>

    </div>

    {/* Sorting */}
    <div className="flex items-center gap-2">

      <label>
        Sort:
      </label>

      <select
        value={sortFromUrl}
        onChange={(e) => {
          const params =
            new URLSearchParams(
              searchParams.toString()
            );

          if (e.target.value) {
            params.set(
              "sort",
              e.target.value
            );
          } else {
            params.delete("sort");
          }

          params.set("page", "1");

          router.push(
            `/products?${params.toString()}`
          );
        }}
        className="border rounded px-3 py-2 bg-white"
      >

        <option value="">
          Default
        </option>

        <option value="price-asc">
          Price: Low to High
        </option>

        <option value="price-desc">
          Price: High to Low
        </option>

        <option value="rating-desc">
          Rating: High to Low
        </option>

        <option value="title-asc">
          Title: A-Z
        </option>

      </select>

    </div>

    {/* Page Size */}
    <div className="flex items-center gap-2">

      <label>
        Page Size:
      </label>

      <select
        value={pageSize}
        onChange={(e) =>
          changePageSize(
            Number(e.target.value)
          )
        }
        className="border rounded px-3 py-2 bg-white"
      >

        <option value={10}>
          10
        </option>

        <option value={20}>
          20
        </option>

        <option value={50}>
          50
        </option>

      </select>

    </div>

  </div>

</div>

        {/* Loading */}
        {loading && (
          <p className="text-center">
            Loading products...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center">

            <p className="text-red-500 mb-4">
              {error}
            </p>

            <button
              onClick={loadProducts}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Retry
            </button>

          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          products.length === 0 && (
            <p className="text-center">
              No products found.
            </p>
          )}

        {/* Products */}

{!loading &&
  !error &&
  products.length > 0 && (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-200">
            <tr>

              <th className="text-left p-4">
                Image
              </th>

              <th className="text-left p-4">
                Title
              </th>

              <th className="text-left p-4">
                Category
              </th>

              <th className="text-left p-4">
                Price
              </th>

              <th className="text-left p-4">
                Rating
              </th>

              <th className="text-left p-4">
                Stock
              </th>

              <th className="p-4 text-left">
                 Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {products.map((product) => (
  <tr
    key={product.id}
    className="border-t"
  >
    <td className="p-4">
      <img
        src={product.thumbnail}
        alt={product.title}
        className="w-16 h-16 object-cover rounded"
      />
    </td>

    <td className="p-4 font-medium">
      <Link
        href={`/products/${product.id}`}
        className="text-blue-600 hover:underline"
      >
        {product.title}
      </Link>
    </td>

    <td className="p-4">
      {product.category}
    </td>

    <td className="p-4">
      ${product.price}
    </td>

    <td className="p-4">
      ⭐ {product.rating}
    </td>

    <td className="p-4">
      {product.stock}
    </td>

    <td className="p-4">
  <div className="flex gap-2">
    <Link
      href={`/products/${product.id}/edit`}
      className="bg-black text-white px-3 py-2 rounded text-sm"
    >
      Edit
    </Link>

    <button
      onClick={() =>
        handleDelete(product.id)
      }
      className="bg-red-600 text-white px-3 py-2 rounded text-sm"
    >
      Delete
    </button>
  </div>
</td>
  </tr>
))}

          </tbody>

        </table>

      </div>


      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">

        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow p-4"
          >

            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-48 object-cover rounded mb-4"
            />

            <h3 className="text-lg font-bold mb-2">
  <Link
    href={`/products/${product.id}`}
    className="text-blue-600 hover:underline"
  >
    {product.title}
  </Link>
</h3>

            <p className="text-gray-600 mb-1">
              Category: {product.category}
            </p>

            <p className="font-medium mb-1">
              Price: ${product.price}
            </p>

            <p className="mb-1">
              Rating: ⭐ {product.rating}
            </p>

            <p>
              Stock: {product.stock}
            </p>

          </div>
        ))}

      </div>
    </>
  )}


        {/* Pagination */}
        {!loading &&
          !error &&
          total > 0 && (

            <div className="mt-6 flex justify-between items-center">

              {/* Showing text */}
              <p className="text-gray-600">

                Showing{" "}

                {(page - 1) *
                  pageSize +
                  1}

                {"–"}

                {Math.min(
                  page * pageSize,
                  total
                )}

                {" "}of{" "}

                {total}

              </p>

              {/* Buttons */}
              <div className="flex gap-2">

                <button
                  onClick={() =>
                    changePage(
                      page - 1
                    )
                  }
                  disabled={page === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map(
                  (pageNumber) => (

                    <button
                      key={
                        pageNumber
                      }
                      onClick={() =>
                        changePage(
                          pageNumber
                        )
                      }
                      className={`px-4 py-2 border rounded ${
                        pageNumber ===
                        page
                          ? "bg-black text-white"
                          : "bg-white"
                      }`}
                    >
                      {pageNumber}
                    </button>

                  )
                )}

                <button
                  onClick={() =>
                    changePage(
                      page + 1
                    )
                  }
                  disabled={
                    page ===
                    totalPages
                  }
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>

              </div>

            </div>

          )}

      </main>

    </div>
  );

  
}