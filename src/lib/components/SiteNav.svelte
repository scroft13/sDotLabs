<nav>
  <a href="/" class="logo">
    <span class="mark">[s.labs]</span>
  </a>
  <div class="links">
    <a href="/" class="active">GALLERY</a>
    <a href="/prints">PRINTS</a>
    <a href="#contact">CONTACT</a>
  </div>
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1240px;
    margin: 0 auto;
    padding: 28px 48px;
  }
  .logo {
    display: flex;
    align-items: baseline;
    gap: 10px;
    text-decoration: none;
    color: var(--ink);
  }
  .mark {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 500;
  }
  .links {
    display: flex;
    align-items: center;
    gap: 36px;
  }
  .links a {
    font-size: 12px;
    letter-spacing: 0.18em;
    text-decoration: none;
    color: var(--muted);
    transition: color 0.15s ease;
  }
  .links a:hover,
  .links a.active {
    color: var(--ink);
  }
  @media (max-width: 640px) {
    nav {
      padding: 20px 24px;
    }
    .links {
      gap: 20px;
    }
  }
</style>
