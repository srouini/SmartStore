import React, { useEffect, useState } from 'react';
import { FiSun, FiMoon, FiDroplet, FiCoffee, FiHeart, FiStar } from 'react-icons/fi';
import { 
  FaPalette, FaLeaf, FaSnowflake, FaGhost, FaWater, 
  FaSkull, FaFire, FaLemon, FaMoon, FaRobot, FaBusinessTime,
  FaPaintBrush, FaUmbrella, FaGem, FaRegSnowflake, FaLaptopCode
} from 'react-icons/fa';

// Theme definitions with icons and colors
const themeData = [
  { name: "light", icon: <FiSun size={16} />, color: "#f8fafc" },
  { name: "dark", icon: <FiMoon size={16} />, color: "#1e293b" },
  { name: "cupcake", icon: <FaPalette size={16} />, color: "#faf7f5" },
  { name: "bumblebee", icon: <FaLemon size={16} />, color: "#fef3c7" },
  { name: "emerald", icon: <FaLeaf size={16} />, color: "#10b981" },
  { name: "corporate", icon: <FaBusinessTime size={16} />, color: "#6b7280" },
  { name: "synthwave", icon: <FaRobot size={16} />, color: "#2d1b69" },
  { name: "retro", icon: <FaPaintBrush size={16} />, color: "#ef9995" },
  { name: "cyberpunk", icon: <FaLaptopCode size={16} />, color: "#ff7598" },
  { name: "valentine", icon: <FiHeart size={16} />, color: "#e96d7b" },
  { name: "halloween", icon: <FaGhost size={16} />, color: "#212121" },
  { name: "garden", icon: <FaLeaf size={16} />, color: "#5c7f67" },
  { name: "forest", icon: <FaLeaf size={16} />, color: "#1eb854" },
  { name: "aqua", icon: <FaWater size={16} />, color: "#09ecf3" },
  { name: "lofi", icon: <FiCoffee size={16} />, color: "#808080" },
  { name: "pastel", icon: <FiDroplet size={16} />, color: "#d1c1d7" },
  { name: "fantasy", icon: <FiStar size={16} />, color: "#6e0b75" },
  { name: "wireframe", icon: <FaLaptopCode size={16} />, color: "#b8b8b8" },
  { name: "black", icon: <FaSkull size={16} />, color: "#000000" },
  { name: "luxury", icon: <FaGem size={16} />, color: "#171618" },
  { name: "dracula", icon: <FaSkull size={16} />, color: "#282a36" },
  { name: "cmyk", icon: <FaPaintBrush size={16} />, color: "#00bcd4" },
  { name: "autumn", icon: <FaFire size={16} />, color: "#d8a384" },
  { name: "business", icon: <FaBusinessTime size={16} />, color: "#1c4e80" },
  { name: "acid", icon: <FaFire size={16} />, color: "#ccff00" },
  { name: "lemonade", icon: <FaLemon size={16} />, color: "#feff6b" },
  { name: "night", icon: <FaMoon size={16} />, color: "#0f172a" },
  { name: "coffee", icon: <FiCoffee size={16} />, color: "#6f4e37" },
  { name: "winter", icon: <FaRegSnowflake size={16} />, color: "#d6e4ff" }
];

const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('light');

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Change theme and save to localStorage
  const changeTheme = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    setCurrentTheme(theme);
  };

  // Toggle between light and dark quickly
  const toggleLightDark = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  };

  // Find current theme data
  const currentThemeData = themeData.find(t => t.name === currentTheme) || themeData[0];

  return (
    <div className="flex items-center gap-2">
      {/* Light/Dark toggle button */}
      <button 
        className="btn btn-ghost btn-circle"
        onClick={toggleLightDark}
        aria-label="Toggle light/dark mode"
      >
        {currentTheme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
      </button>

      {/* Theme dropdown */}
      <div className="dropdown dropdown-end z-50">
        <div 
          tabIndex={0} 
          role="button" 
          className="btn btn-sm btn-ghost gap-1 normal-case"
          aria-label="Select theme"
        >
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentThemeData.color }}></div>
          <span className="hidden md:inline">{currentTheme}</span>
        </div>
        <div tabIndex={0} className="dropdown-content bg-base-200 text-base-content rounded-box h-[600px] top-px w-56  overflow-scroll shadow-2xl">
          <div className="grid grid-cols-1 gap-3 p-3" tabIndex={0}>
            {themeData.map((theme) => (
              <button
                key={theme.name}
                className={`outline-base-content overflow-hidden rounded-lg text-left ${currentTheme === theme.name ? 'outline outline-2 outline-offset-2' : ''}`}
                data-set-theme={theme.name}
                onClick={() => changeTheme(theme.name)}
              >
                <div data-theme={theme.name} className="bg-base-100 text-base-content w-full cursor-pointer font-sans">
                  <div className="grid grid-cols-5 grid-rows-3">
                    <div className="col-span-5 row-span-3 row-start-1 flex items-center gap-2 px-4 py-3">
                      <div className="flex-shrink-0 w-5 h-5">{theme.icon}</div>
                      <div className="flex-grow text-sm font-bold">{theme.name}</div>
                      <div className="flex flex-shrink-0 flex-wrap gap-1">
                        <div className="bg-primary w-2 h-2 rounded-full"></div>
                        <div className="bg-secondary w-2 h-2 rounded-full"></div>
                        <div className="bg-accent w-2 h-2 rounded-full"></div>
                        <div className="bg-neutral w-2 h-2 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
