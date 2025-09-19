# **App Name**: SplatTag

## Core Features:

- Player Profile Creation: Create and store player profiles with a name, chosen emoji, and team assignment in the browser's localStorage.
- Team and Color Selection: Allow players to join a team ('Splat Squad' or 'Ink Masters') and choose a unique color from a predefined palette.
- Game Timer: Implement a countdown timer that automatically starts and manages the game duration (15 or 30 minutes), triggered by the first player's vote. Automatically redirect players from /setup to /game when first vote is cast. Redirect players to GameOver screen when time runs out.
- Zone Capture: Enable players to capture zones by scanning QR codes and waiting 10 seconds on the /capture/:uuid page. Update zone ownership and reflect changes on the main game page.
- Game State Persistence: Persist the current game state including team compositions, captured zones, and the remaining time, locally to the browser to ensure synchronized experience of players.
- QR Code Generation: Dynamically generate QR codes for each zone on the admin page (/qr-codes), using a unique and unguessable URL structure.
- Game Over Logic: Determine the winner based on zone control when the timer expires or when all zones are captured by one team.

## Style Guidelines:

- Primary color: Vibrant magenta (#FF69B4) for energy and playfulness.
- Background color: Dark slate gray (#37474F) to provide contrast and make the vibrant colors pop.
- Accent color: Electric blue (#7DF9FF) to highlight interactive elements and create a dynamic feel.
- Body and headline font: 'Fredoka One' (sans-serif) for a friendly and playful look. Note: currently only Google Fonts are supported.
- Use custom-designed icons representing zones and game actions with a Splatoon-inspired aesthetic.
- Design a fluid, responsive grid layout using Tailwind CSS to ensure a consistent user experience across different devices.
- Implement subtle bounce-in animations and transitions using CSS for a lively and engaging user experience.