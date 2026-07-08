import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout.js";
import Home from "./pages/Home.js";
import Album from "./pages/Album.js";
import Anniversary from "./pages/Anniversary.js";
import Profile from "./pages/Profile.js";
import Login from "./pages/Login.js";
import PostCompose from "./pages/PostCompose.js";

function ProtectedLayout() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => { setAuthed(!!localStorage.getItem("token")); }, []);
  if (authed === null) return null;
  if (!authed) return <Navigate to="/login" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/album" element={<Album />} />
          <Route path="/anniversary" element={<Anniversary />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/compose" element={<PostCompose />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
