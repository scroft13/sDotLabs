<script>
  import Contact from '$lib/components/Contact.svelte';
  import Portfolio from '$lib/components/Portfolio.svelte';
  import Services from '$lib/components/Services.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';
  import { fade } from 'svelte/transition';
</script>

<header class="sticky top-0 bg-transparent z-100">
  <Toolbar />
</header>

<main class="min-w-full">
  <div class="image-container">
    <img src="white_no_url.png" alt="logo" class="foreground-image" />
    <img
      src="AdobeStock_254658845_Preview.jpeg"
      alt="main aerial"
      class="background-image-desktop"
    />

    <div class="background-image" />
  </div>
  <section id="portfolio">
    <Portfolio />
  </section>
  <section id="services" in:fade>
    <Services />
  </section>

  <section id="contact" in:fade>
    <Contact />
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

  .background-image-desktop {
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
  @media (max-width: 768px) {
    .foreground-image {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 85%;
      height: auto;
    }

    .background-image {
      background-image: url('AdobeStock_254658845_Preview.jpeg'); /* Replace with your image URL */
      background-size: cover; /* Scale image to cover entire container */
      background-position: center; /* Center the image */
      background-repeat: no-repeat; /* Prevent tiling */
      width: 100%;
      height: 105vh;
    }
    .background-image-desktop {
      display: none;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    /* Tablet styles */
  }
</style>
