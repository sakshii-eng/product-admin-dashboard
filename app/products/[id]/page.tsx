"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getProductById } from "@/services/productService";
import { Product } from "@/types/product";

interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

interface ProductDetails extends Product {
  images: string[];
  reviews: Review[];
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] =
    useState<ProductDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProductById(
            params.id as string
          );

        setProduct(data);
      } catch (error) {
        setError(
          "Product not found"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">

        <p className="text-red-500 text-xl mb-4">
          Product not found
        </p>

        <button
          onClick={() =>
            router.push("/products")
          }
          className="bg-black text-white px-4 py-2 rounded"
        >
          Back to Products
        </button>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
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

      <main className="p-8 max-w-6xl mx-auto">

        {/* Back button */}
        <button
          onClick={() =>
            router.push("/products")
          }
          className="mb-6 px-4 py-2 border rounded bg-white"
        >
          ← Back to Products
        </button>

        {/* Product information */}
        <div className="bg-white rounded-lg shadow p-6">

          <div className="grid md:grid-cols-2 gap-8">

            {/* Images */}
            <div>

              <img
                src={product.images?.[0]}
                alt={product.title}
                className="w-full h-80 object-contain rounded"
              />

              <div className="flex gap-3 mt-4">

                {product.images?.map(
                  (image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  )
                )}

              </div>

            </div>

            {/* Details */}
            <div>

              <h2 className="text-3xl font-bold mb-4">
                {product.title}
              </h2>

              <p className="text-gray-600 mb-4">
                {product.description}
              </p>

              <p className="text-2xl font-bold mb-3">
                ${product.price}
              </p>

              <p className="mb-2">
                ⭐ Rating:{" "}
                {product.rating}
              </p>

              <p className="mb-2">
                Stock:{" "}
                {product.stock}
              </p>

              <p className="mb-2">
                Category:{" "}
                {product.category}
              </p>

            </div>

          </div>

        </div>

        {/* Reviews */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">

          <h2 className="text-2xl font-bold mb-6">
            Reviews
          </h2>

          {product.reviews &&
          product.reviews.length > 0 ? (
            <div className="space-y-4">

              {product.reviews.map(
                (review, index) => (
                  <div
                    key={index}
                    className="border-b pb-4"
                  >

                    <div className="flex justify-between">

                      <h3 className="font-bold">
                        {review.reviewerName}
                      </h3>

                      <span>
                        ⭐ {review.rating}
                      </span>

                    </div>

                    <p className="mt-2 text-gray-600">
                      {review.comment}
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(
                        review.date
                      ).toLocaleDateString()}
                    </p>

                  </div>
                )
              )}

            </div>
          ) : (
            <p className="text-gray-500">
              No reviews available.
            </p>
          )}

        </div>

      </main>

    </div>
  );
}