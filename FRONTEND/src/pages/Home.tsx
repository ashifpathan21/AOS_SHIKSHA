import HeroSection from "../components/basic/HeroSection";
import Navbar from "../components/basic/Navbar";

const Home = () => {
  // Function to switch themes safely
  function toggleTheme() {
    const root = document.documentElement; // Targets the <html> element
    const currentTheme = root.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";

    // Set the attribute to immediately trigger CSS variable overrides
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("ace-shiksha-theme", newTheme);
  }

  // Optional: Apply persistent choice on page load
  document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("ace-shiksha-theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  });
  return (
    <div>
      <Navbar />
      {/* <button onClick={toggleTheme} className="p-4 ">
        change
      </button> */}
      <HeroSection />
      <div className="h-screen"></div>
    </div>
  );
};

export default Home;
