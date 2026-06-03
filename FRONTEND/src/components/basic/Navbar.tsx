import { useState, type MouseEvent } from "react";
import Logo from "../assets/Logo";
import { BookOpenText, ChartNoAxesColumn, Globe, Swords } from "lucide-react";
const Navbar = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const container = event.currentTarget;
    const rect = container.getBoundingClientRect();

    setCoords({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    setOpacity(0.8);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <nav className="navbar relative ">
      <Logo className="w-25 md:w-35 lg:w-45 xl:w-45 aspect-video object-cover  scale-125 m-0 p-1 -rotate-8 absolute left-0" />
      <section
        className="relative max-w-70 md:max-w-100 lg:max-w-130 border h-15   justify-around hover:shadow-bg-hover hover:shadow-lg  flex items-center text-btn-secondary-text flex-1 ml-10 py-2 px-3 bg-transparent z-0  backdrop-blur-3xl w-full shadow   rounded-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          ["--glow-x" as any]: `${coords.x}px`,
          ["--glow-y" as any]: `${coords.y}px`,
          ["--glow-opacity" as any]: opacity,
        }}
      >
        <button data-tooltip="Learn" className="navbar__link ">
          <BookOpenText />
        </button>
        <button className="navbar__link " data-tooltip="Playground">
          <Swords />
        </button>
        <button className="navbar__link " data-tooltip="ShowOff">
          <Globe />
        </button>
        <button className="navbar__link " data-tooltip="Leaderboard">
          <ChartNoAxesColumn />
        </button>
        <div className="glow-overlay rounded-full" />
      </section>
    </nav>
  );
};

export default Navbar;
