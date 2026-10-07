import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div
      className="card"
      style={{
        textAlign: "center",
        padding: "60px",
      }}
    >
      <h1>404</h1>

      <h2>Page Not Found</h2>

      <br />

      <Link to="/">
        <button>Go to Dashboard</button>
      </Link>
    </div>
  );
}

export default NotFound;