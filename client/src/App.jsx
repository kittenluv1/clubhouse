import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/home'
import Layout from "./pages/Layout";
import SearchResults from "./pages/SearchResults";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/results" element={
            <Layout>
              <SearchResults/>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
