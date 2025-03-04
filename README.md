# Design Portfolio

A modern design portfolio built with Next.js, Tailwind CSS v4, Framer Motion, and Phosphor Icons.

## Features

- **Next.js 15** with App Router
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **Phosphor Icons** for beautiful icons
- Responsive design
- Dark mode support
- TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js 18.17 or later

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd design-portfolio
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
design-portfolio/
├── public/             # Static assets
├── src/
│   ├── app/            # App router pages
│   │   ├── globals.css # Global styles
│   │   ├── layout.tsx  # Root layout
│   │   └── page.tsx    # Home page
│   └── components/     # React components
│       ├── AnimatedCard.tsx
│       ├── FeaturedSection.tsx
│       └── Navbar.tsx
├── package.json        # Project dependencies and scripts
└── README.md           # Project documentation
```

## Customization

### Tailwind CSS

Tailwind CSS v4 is configured with PostCSS. You can customize the theme in the `globals.css` file using the `@theme inline` directive.

### Adding Pages

To add new pages, create new directories in the `src/app` directory following the Next.js App Router conventions.

### Components

All reusable components are stored in the `src/components` directory. You can create new components as needed.

## Deployment

This project can be deployed on any platform that supports Next.js, such as Vercel, Netlify, or AWS Amplify.

For the easiest deployment experience, use Vercel:

```bash
npm install -g vercel
vercel
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Phosphor Icons Documentation](https://phosphoricons.com/)

## License

This project is licensed under the MIT License.
