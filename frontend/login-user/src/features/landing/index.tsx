import { Link } from "react-router-dom";

export const LandingPage = () => {
  return (
    <div>
      <h1>Welcome to the Landing Page</h1>
      <Link to="/login">Go to Login</Link>
    </div>
  );
};
