import React from "react";
import { createRoot } from "react-dom/client";
import { Home } from "./Components/Home";

const root = createRoot(document.body);
root.render(
  <div>
    <Home />
  </div>
);