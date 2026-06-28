<div align="center">
  <img src="public/assets/logo.png" alt="Room VSA Logo" width="150" />
  <h1>Room VSA (Visual Space Analysis)</h1>
  <p><strong><a href="https://roomvsa.nicx.dev">Live Site : roomvsa.nicx.dev</a></strong></p>

  <p>
    <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
    <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
    <img src="https://img.shields.io/badge/cloudflare-%23F38020.svg?style=for-the-badge&logo=Cloudflare&logoColor=white" alt="Cloudflare Workers" />
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge" alt="License: MIT" />
  </p>
</div>

Room VSA is a high-performance, client-side web application for 3D room visualization and interior design. Built with React, Vite, and React Three Fiber, it allows users to dynamically configure room dimensions, swap themes, and manipulate furniture in real-time.

## Demo and Screenshots

**Video Demo**

<video src="public/assets/demo.mp4" width="100%" controls></video>

**Screenshots**

<div align="center">
  <img src="public/assets/screenshot1.png" alt="Room VSA Interface 1" width="32%" />
  <img src="public/assets/screenshot2.png" alt="Room VSA Interface 2" width="32%" />
  <img src="public/assets/screenshot3.png" alt="Room VSA Interface 3" width="32%" />
</div>

## Features

- **3D Visualization:** Real-time rendering using Three.js and React Three Fiber.
- **Dynamic Configuration:** Adjust room dimensions, wall colors, floor colors, and lighting directly from the control panel.
- **Interactive Furniture:** Add, move, rotate, and customize furniture items like beds, wardrobes, and windows.
- **Local Persistence:** Your room layout is automatically saved securely to your browser's local storage.
- **Import/Export:** Download your room configuration as a JSON file and load it back anytime.

## Technical Architecture

- **Frontend:** React 19, TypeScript
- **3D Engine:** React Three Fiber, Drei, Three.js
- **State Management:** Zustand (with Zod validation for secure persistence)
- **Build Tool:** Vite

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Security

Room VSA utilizes Zod to strictly validate all configurations loaded from local storage or uploaded via JSON files, ensuring robust protection against client-side injection and DoS attacks.

## Attribution

<a href="https://unsplash.com/illustrations/isometric-view-of-a-bedroom-with-bed-and-tv-AynTSqYghis?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Illustration</a> by <a href="https://unsplash.com/@cansu_tech/illustrations?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Cansu Sarp</a> on <a href="https://unsplash.com/illustrations?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
