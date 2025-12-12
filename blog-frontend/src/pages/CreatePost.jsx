import { useState, useEffect } from "react";
import API from "../api/api";
import { useNavigate, useParams } from "react-router-dom";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    API.get("/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.log(err));

    if (id) {
      API.get(`/posts/${id}`)
        .then(res => {
          const p = res.data.post;
          setTitle(p.title);
          setContent(p.content);
          setSelectedCategories(p.categories.map(c => c._id));
        })
        .catch(err => console.log(err));
    }
  }, [id]);

  const handleFileChange = (e) => setImages(e.target.files);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      selectedCategories.forEach(cat => formData.append("categories", cat));
      for (let i = 0; i < images.length; i++) formData.append("images", images[i]);

      if (id) {
        await API.put(`/posts/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Post updated!");
      } else {
        await API.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Post created!");
      }
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Error saving post");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{id ? "Edit" : "Create"} Post</h2>

      {/* Title */}
      <input
        className="w-full border p-2 rounded mb-3"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      {/* Content */}
      <textarea
        className="w-full border p-2 rounded mb-3 h-48"
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      {/* Categories */}
      <label className="block mb-1 font-medium">Categories</label>
      <select
        multiple
        value={selectedCategories}
        onChange={e =>
          setSelectedCategories(Array.from(e.target.selectedOptions, o => o.value))
        }
        className="w-full border p-2 rounded mb-3"
      >
        {categories.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>

      {/* Image Upload */}
      <label className="block mb-1 font-medium">Images</label>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="mb-3"
      />

      {/* Image Preview */}
      {images && images.length > 0 && (
        <div className="image-preview-container">
          {Array.from(images).map((file, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-24 h-24 object-cover mr-2 mb-2 rounded border"
            />
          ))}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {id ? "Update" : "Publish"}
      </button>
    </div>
  );
}
