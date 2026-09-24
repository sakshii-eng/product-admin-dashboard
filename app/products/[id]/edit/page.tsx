"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getProductById,
  updateProduct,
} from "@/services/productService";

import {
  saveUpdatedProduct,
} from "@/services/localProductService";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] =
    useState("");
  const [stock, setStock] = useState("");

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const loadProduct = async () => {
      try {
        const data =
          await getProductById(
            params.id as string
          );

        setTitle(data.title);
        setDescription(data.description);
        setPrice(String(data.price));
        setCategory(data.category);
        setStock(String(data.stock));
      } catch (error) {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id, router]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError(
        "Price must be greater than 0"
      );
      return;
    }

    if (!category.trim()) {
      setError("Category is required");
      return;
    }

    if (
      stock === "" ||
      Number(stock) < 0
    ) {
      setError("Stock cannot be negative");
      return;
    }

    try {
      setSaving(true);

      const updatedProduct =
  await updateProduct(
    params.id as string,
    {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      stock: Number(stock),
    }
  );

saveUpdatedProduct(updatedProduct);

alert(
  "Product updated successfully!"
);

      router.push(
        `/products/${params.id}`
      );
    } catch (error) {
      setError(
        "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-black text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Product Admin Dashboard
        </h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.replace("/login");
          }}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-2xl mx-auto p-8">
        <button
          onClick={() =>
            router.push(
              `/products/${params.id}`
            )
          }
          className="mb-6 px-4 py-2 border rounded bg-white"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">
            Edit Product
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block mb-1 font-medium">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

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
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Price
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Stock
              </label>

              <input
                type="number"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
            >
              {saving
                ? "Updating..."
                : "Update Product"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}