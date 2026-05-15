import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "./Admin";
import WebApp from "./WebApp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Admin />} />
        <Route path="/webapp" element={<WebApp />} />
      </Routes>
    </BrowserRouter>
  );
}
