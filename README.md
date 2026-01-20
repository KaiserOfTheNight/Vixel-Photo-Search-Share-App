# Vixel

**Every pixel tells a story**

A wallpaper app that doesn't suck. Built because I wanted something simple, fast, and beautiful to find wallpapers without the usual bloat.

## What's This?

Vixel is a React Native app that pulls stunning wallpapers from Pexels. No ads, no weird permissions, no nonsense. Just wallpapers.

You can search, filter, browse categories, and download whatever catches your eye. That's it.

## Screenshots

Coming soon (or just run the app, it's faster)

## Why I Built This

I got tired of wallpaper apps that:
- Asked for 47 permissions
- Had more ads than wallpapers
- Took 5 taps to download one image
- Looked like they were designed in 2012

So here we are.

## Features

**The basics:**
- Search for literally anything
- Browse by categories (Nature, Cities, Space, etc.)
- Download wallpapers to your phone
- Share them with friends

**The nice-to-haves:**
- Filter by color (because sometimes you just want blue wallpapers)
- Filter by orientation (landscape, portrait, square)
- Sort by popular or latest
- Infinite scroll (because pagination is annoying)
- Pull to refresh (because why not)
- Full-screen previews
- Actually works offline (sort of - cached images will still show)

**The UI stuff:**
- Dark mode (only mode, actually)
- Smooth animations
- Doesn't feel laggy
- Clean, minimal interface

## Getting Started

You'll need Node.js and Expo CLI installed. If you don't have them, Google is your friend.

**Clone and install:**
```bash
git clone https://github.com/KaiserOfTheNight/Vixel-Photo-Search-Share-App
cd vixel
npm install
```

**Get a Pexels API key:**
1. Go to https://www.pexels.com/api/
2. Sign up (it's free)
3. Copy your API key

**Add your API key:**

Create a `.env` file in the root folder:
```env
API_KEY=your_pexels_api_key_here
```

**Run it:**
```bash
npx expo start
```

Then press `i` for iOS or `a` for Android. Or scan the QR code with Expo Go if you're testing on a real device.

## How It Works

Pretty straightforward:
- Welcome screen shows rotating wallpapers to get you hyped
- Main screen shows a grid of wallpapers
- Tap one to see it full screen
- Download or share from there
- Use filters if you're picky

## Project Structure

```
vixel/
├── app/
│   ├── _layout.jsx       # Navigation setup
│   ├── index.jsx         # Welcome screen
│   └── home.jsx          # Main app (where the magic happens)
├── .env                  # Your API key goes here
└── package.json          # Dependencies
```

Nothing fancy. Just clean code organized in a way that makes sense.

## Tech Stack

- React Native (obviously)
- Expo (because I'm not a masochist)
- Pexels API (for the wallpapers)
- A bunch of Expo packages for stuff like file system, sharing, etc.

Full dependency list is in `package.json` if you care about that kind of thing.

## API Limits

Pexels free tier gives you:
- 200 requests/hour
- 20,000 requests/month

More than enough for personal use. If you're planning to release this publicly, you might want to upgrade or implement some caching.

## Known Issues

- None that I know of, but I'm sure you'll find some
- If you do, open an issue or fix it yourself and send a PR

## Future Ideas (Maybe)

- Favorites/Collections
- Set wallpaper directly from the app
- Daily wallpaper notifications
- More filter options
- Whatever else sounds fun

## Contributing

Sure, why not. Fork it, make it better, send a PR. Just keep the code clean and the commits meaningful.

## License

MIT License - do whatever you want with it. Copy it, modify it, sell it, I don't care. Just don't blame me if something breaks.

## Credits

Thanks to Pexels for the free API and the photographers who upload their work there. You're the real MVPs.

Built with Expo because life's too short to deal with native builds for a side project.

---

Built by a human who likes nice wallpapers and clean code.

*P.S. - If you actually read this whole README, you're either really interested or really bored. Either way, hope the app works for you.*
