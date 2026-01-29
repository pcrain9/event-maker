import { Link } from "react-router-dom";
import { getEventItems, getEvents } from "../../api";

export const LandingPage = () => {
  const handleClick = () => {
    getEventItems(1);
  };

  return (
    <div>
      <h1>Welcome to the Landing Page</h1>
      <button onClick={handleClick}>Click Me!</button>
      <Link to="/login">Go to Login</Link>
    </div>
  );
};
