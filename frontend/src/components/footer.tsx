export function Footer() {
  return (
    <footer className="footer p-10 bg-neutral text-neutral-content">
      <nav>
        <header className="footer-title">Legal</header>
        <a className="link link-hover">Imprint</a>
        <a className="link link-hover">Terms</a>
        <a className="link link-hover">Privacy</a>
      </nav>
      <nav>
        <header className="footer-title">Resources</header>
        <a className="link link-hover">What is MEV?</a>
        <a className="link link-hover">MEV Smoothing</a>
        <a className="link link-hover">OO</a>
      </nav>
      <nav>
        <header className="footer-title">Links</header>
        <a className="link link-hover">GitHub</a>
        <a className="link link-hover">Twitter</a>
        <a className="link link-hover">Discord</a>
      </nav>
    </footer>
  );
}
