import { useEffect, useState } from "react";
import API from "../api/api";

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    API.get("/posts") 
      .then(res => setPosts(res.data.posts))
      .catch(err => console.log(err));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="app-container">
      <h1>All Posts</h1>

      {posts.length === 0 && <p>No posts available</p>}

      {posts.map(post => (
        <div className="post-card" key={post._id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          {post.images && post.images.map((img, i) => (
            <img 
              key={i} 
              src={`http://localhost:6001/uploads/${img}`} 
              alt="post" 
              width="150" 
              style={{ marginRight: "10px", marginBottom: "10px" }}
            />
          ))}
          <small>By: {post.author?.name}</small>
        </div>
      ))}

      {/* Buttons below posts */}
      <div className="bottom-buttons" style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button className="create-btn" onClick={() => window.location.href="/create"}>
          Create Post
        </button>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
