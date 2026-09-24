"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createProduct } from "@/services/productService";

import { saveAddedProduct } from "@/services/localProductService";

export default function AddProductPage() {
  const router = useRouter();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [stock, setStock] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    // Validation
    if (!title.trim()) {
      setError(
        "Title is required"
      );
      return;
    }

    if (!description.trim()) {
      setError(
        "Description is required"
      );
      return;
    }

    if (!price || Number(price) <= 0) {
      setError(
        "Price must be greater than 0"
      );
      return;
    }

    if (!category.trim()) {
      setError(
        "Category is required"
      );
      return;
    }

    if (
      !stock ||
      Number(stock) < 0
    ) {
      setError(
        "Stock cannot be negative"
      );
      return;
    }

    try {
      setLoading(true);

      const newProduct =
  await createProduct({
    title: title.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.trim(),
    stock: Number(stock),
  });

saveAddedProduct(newProduct);

alert("Product added successfully!");

      alert(
        "Product added successfully!"
      );

      router.push("/products");
    } catch (error) {
      setError(
        "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-black text-white p-4 flex justify-between items-center">

        <h1 className="text-xl font-bold">
          Product Admin Dashboard
        </h1>

        <button
          onClick={() => {
            localStorage.removeItem(
              "token"
            );

            router.replace(
              "/login"
            );
          }}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Logout
        </button>

      </nav>

      <main className="max-w-2xl mx-auto p-8">

        <button
          onClick={() =>
            router.push("/products")
          }
          className="mb-6 px-4 py-2 border rounded bg-white"
        >
          ← Back to Products
        </button>

        <div className="bg-white rounded-lg shadow p-6">

          <h2 className="text-2xl font-bold mb-6">
            Add Product
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Title */}
            <div>

              <label className="block mb-1 font-medium">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Product title"
              />

            </div>

            {/* Description */}
            <div>

              <label className="block mb-1 font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                className="w-full border rounded px-3 py-2"
                rows={4}
                placeholder="Product description"
              />

            </div>

            {/* Price */}
            <div>

              <label className="block mb-1 font-medium">
                Price
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Product price"
              />

            </div>

            {/* Category */}
            <div>

              <label className="block mb-1 font-medium">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Product category"
              />

            </div>

            {/* Stock */}
            <div>

              <label className="block mb-1 font-medium">
                Stock
              </label>

              <input
                type="number"
                value={stock}
                onChange={(e) =>
                  setStock(
                    e.target.value
                  )
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Stock quantity"
              />

            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
            >
              {loading
                ? "Adding..."
                : "Add Product"}
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}