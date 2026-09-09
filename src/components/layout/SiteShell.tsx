import { Link, Outlet } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useUiStore } from "@/stores/uiStore";

export function SiteShell() {
  const { mode, toggleMode } = useUiStore();
  document.documentElement.dataset.mode = mode;
  return <div className="site-shell"><header className="site-nav"><Link className="wordmark" to="/"><span>TC</span><b>Tony Consults</b></Link><nav><Link to="/portfolio">Portfolio</Link><Link to="/services">Services</Link><Link to="/blog">Journal</Link><Link to="/marketplace">Marketplace</Link></nav><div><button className="icon-button" onClick={toggleMode} aria-label="Switch color mode">{mode === "light" ? <Moon size={17} /> : <Sun size={17} />}</button><Link className="nav-cta" to="/contact">Start a project</Link></div></header><Outlet /><footer className="site-footer"><b>Tony Consults</b><p>Software, sound, automotive systems and security work.</p><Link to="/login">Workspace sign in</Link></footer></div>;
}
