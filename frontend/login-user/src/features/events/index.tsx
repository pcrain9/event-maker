import { useNavigate } from "react-router-dom";

export const Event = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <h1>Event</h1>
    </div>
  );
};
