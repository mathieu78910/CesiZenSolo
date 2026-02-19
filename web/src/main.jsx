import { createRoot } from "react-dom/client";
import { setApiBaseUrl } from "@back/cesizen-api";
import App from "./App.jsx";
import "./styles/index.css";

setApiBaseUrl(import.meta.env.VITE_API_URL ?? "http://localhost:3000");

const root = createRoot(document.getElementById("root"));
root.render(<App />);
