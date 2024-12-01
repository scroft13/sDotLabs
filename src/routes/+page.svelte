<script>
  import Portfolio from '$lib/components/Portfolio.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';
  import { fade } from 'svelte/transition';
</script>

<header class="sticky top-0 bg-transparent z-100">
  <Toolbar />
</header>

<main class="min-w-full">
  <div class="image-container">
    <img src="white_no_url.png" alt="main aerial" class="foreground-image" />

    <img src="AdobeStock_254658845_Preview.jpeg" alt="main aerial" class="background-image" />
  </div>
  <Portfolio />
  <section id="services" in:fade>
    <h2>Services</h2>
    <p>
      Capture breathtaking aerial photos and videos of real estate properties with our
      state-of-the-art drone technology. We offer:
    </p>
    <ul>
      <li>High-resolution photography and 4K videography</li>
      <li>3D mapping and modeling</li>
      <li>Virtual tours and interactive experiences</li>
    </ul>
    <a href="/aerial">Learn More</a>
  </section>

  <section id="pricing" in:fade class="h-[2000px]">
    <h2>Pricing</h2>
    <p>
      Transform your images into precise 3D models with our photogrammetry services. We can create:
    </p>
    <ul>
      <li>Detailed 3D models of objects and environments</li>
      <li>Accurate measurements and analysis</li>
      <li>Interactive 3D visualizations</li>
    </ul>
    <a href="/photogrammetry">Learn More</a>
  </section>

  <section id="photography" in:fade>
    <h2>Photography & Videography</h2>
    <p>
      Our experienced photographers and videographers can capture the essence of your projects with
      stunning visuals. We specialize in:
    </p>
    <ul>
      <li>Real estate photography and videography</li>
      <li>Architectural photography</li>
      <li>Commercial and product photography</li>
    </ul>
    <a href="/photography">Learn More</a>
  </section>
</main>

<footer>
  <p>&copy; {new Date().getFullYear()} Sdotlabs</p>
</footer>

<style>
  .image-container {
    position: relative;
    top: -100px;
    z-index: -100;
  }

  .background-image {
    display: block;
    width: 100%;
    height: auto;
  }

  .foreground-image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 28%;
    height: auto;
  }
  img {
    width: 100%;
    height: auto;
  }

  footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 10px;

    width: 100%;
  }
</style>
