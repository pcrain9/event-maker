import { FormEvent, FormEventHandler, useState } from "react";
import axios from "axios";

function App() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const req = {
      username: username,
      password: password,
    };
    const response = await axios.post("http://localhost:8000/users/login", req);
    console.log(response);
  };

  return (
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
  );
}

export default App;
