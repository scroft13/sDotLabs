<script>
  import { onMount } from 'svelte';

  let pageTitle = 'Seegle - Smarter, Faster, Better Collaboration';

  onMount(() => {
    document.title = pageTitle;
  });
</script>

<section class="seegle-intro">
  <h1>Welcome to Seegle</h1>
  <p>
    Seegle is the ultimate platform for teams and individuals who want to work smarter, faster, and
    more efficiently. Designed for seamless collaboration, Seegle combines real-time communication,
    AI-powered insights, and an intuitive workspace to help you stay focused and productive.
  </p>
</section>

<section class="seegle-features">
  <h2>Key Features</h2>
  <ul>
    <li>🚀 Real-Time Collaboration – Share ideas, files, and updates instantly.</li>
    <li>🤖 AI-Powered Assistance – Automate tasks and get intelligent suggestions.</li>
    <li>📅 Streamlined Workflow – Organize projects efficiently.</li>
    <li>🔐 Secure & Reliable – Your data is protected with industry-leading security.</li>
    <li>📱 Cross-Platform – Access Seegle from anywhere, anytime.</li>
  </ul>
</section>

<section class="seegle-cta">
  <h2>Get Started with Seegle</h2>
  <p>Join thousands of teams using Seegle to boost productivity and collaboration.</p>
  <a href="/signup" class="cta-button">Sign Up Now</a>
</section>

<style>
  .seegle-intro,
  .seegle-features,
  .seegle-cta {
    padding: 2rem;
    text-align: center;
  }

  .seegle-intro h1,
  .seegle-features h2,
  .seegle-cta h2 {
    color: #ffcc00;
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .seegle-intro p,
  .seegle-features ul,
  .seegle-cta p {
    font-size: 1.2rem;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
  }

  .seegle-features ul {
    list-style: none;
    padding: 0;
  }

  .seegle-features li {
    margin: 0.5rem 0;
    font-size: 1.2rem;
  }

  .cta-button {
    display: inline-block;
    background: #ffcc00;
    color: #333;
    padding: 1rem 2rem;
    font-size: 1.5rem;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 1rem;
  }

  .cta-button:hover {
    background: #e6b800;
  }
</style>
