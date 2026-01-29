import { FormEvent, useState } from "react";
import { loginUser } from "../../api";
import { useNavigate } from "react-router";

export const Login = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorLoggingin, setErrorLoggingin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorLoggingin(false);
    try {
      const result = await loginUser({
        username: username,
        password: password,
      });
      console.log(result);
      if (result) navigate("/");
    } catch (error) {
      setErrorLoggingin(true);
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      {errorLoggingin && <h1>error logging in!</h1>}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">submit</button>
        </div>
      </form>
    </div>
  );
};
