<section id="contact">
  <div class="rule" />
  <h2>Get in touch</h2>
  <a href="mailto:hello@sdotlabs.com">hello@sdotlabs.com</a>
</section>

<footer>
  <div>[S.] SDOTLABS — EST. 2026</div>
</footer>

<style>
  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 0 32px 96px;
    text-align: center;
  }
  .rule {
    width: 40px;
    height: 1px;
    background: var(--accent);
  }
  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 34px;
  }
  section a {
    font-size: 13px;
    letter-spacing: 0.14em;
    color: var(--muted);
    text-decoration: none;
    border-bottom: 1px solid #c9c4bc;
    padding-bottom: 3px;
    transition: color 0.15s ease, border-bottom-color 0.15s ease;
  }
  section a:hover {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }
  footer {
    display: flex;
    justify-content: center;
    padding: 0 32px 72px;
  }
  footer div {
    font-size: 11px;
    letter-spacing: 0.28em;
    color: var(--muted);
  }
</style>
