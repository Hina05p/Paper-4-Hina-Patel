import { useEffect, useState, useCallback } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const limit = 6;
  const navigate = useNavigate();

  // fetch posts function (wrapped in useCallback)
  const fetchPosts = useCallback(async () => {
    try {
      const res = await API.get("/posts", {
        params: { page, limit, includeDeleted: false },
      });

      let filteredPosts = res.data.posts || [];

      if (search.trim()) {
        filteredPosts = filteredPosts.filter(
          p =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.content.toLowerCase().includes(search.toLowerCase())
        );
      }

      setPosts(filteredPosts);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  }, [page, search]);

  // effect hook
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto p-4">

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1); // reset page on search
          }}
          className="border p-2 rounded w-full sm:w-1/2"
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => navigate("/create")}
        >
          Create Post
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts found</p>
        ) : (
          posts.map(post => (
            <div
              key={post._id}
              className="border rounded shadow hover:shadow-lg transition p-4 flex flex-col"
            >

              {/* Image */}
              {post.images?.length > 0 && (
                <img
                  src={`http://localhost:6001/uploads/${post.images[0]}`}
                  alt={post.title}
                  className="h-48 w-full object-cover rounded mb-2"
                />
              )}

              {/* Content */}
              <h2 className="font-bold text-lg mb-1">{post.title}</h2>
              <p className="text-gray-600 flex-grow">
                {post.excerpt || post.content.slice(0, 100) + "..."}
              </p>

              {/* Footer */}
              <div className="mt-3 flex justify-between items-center">
                <small className="text-gray-500">
                  {post.author?.name || "Unknown"}
                </small>

                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => navigate(`/edit/${post._id}`)}
                >
                  Edit
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
