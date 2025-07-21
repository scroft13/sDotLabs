// // src/routes/+server.ts
// export function GET() {
//   const getRandomImages = (count = 20): string[] => {
//     const baseUrl = 'https://picsum.photos/400';
//     const images: string[] = [];
//     for (let i = 0; i < count; i++) {
//       images.push(`${baseUrl}?random=${Math.random()}`);
//     }
//     return images;
//   };

//   return new Response(JSON.stringify({ randomImages: getRandomImages() }), {
//     headers: { 'Content-Type': 'application/json' },
//   });
// }
