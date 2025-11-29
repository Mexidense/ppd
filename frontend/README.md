# Frontend - PPD UI

The frontend is built with Next.js 16, React 19, TypeScript, and shadcn/ui components with a custom dark theme.

## 🎨 Design System

### Color Scheme

Based on the provided design, the app uses a dark theme with:

- **Background**: Dark charcoal (`#2B2B2B`)
- **Cards**: Lighter dark gray (`#3A3A3A`)
- **Primary/Accent**: Yellow-cream (`#F4E5A6`) for badges and footers
- **Text**: Off-white/Light gray
- **Success**: Green for wallet connection status

### Components

All UI components are built using [shadcn/ui](https://ui.shadcn.com/) which provides:
- Fully customizable React components
- Built on Radix UI primitives
- Styled with Tailwind CSS
- TypeScript support
- Accessible by default

## 📁 Project Structure

```
app/
├── layout.tsx          # Root layout with Sidebar
├── page.tsx            # Home page (All documents)
├── library/
│   └── page.tsx        # My library page (Purchased docs)
├── published/
│   └── page.tsx        # Published docs page (Uploaded docs)
└── globals.css         # Global styles with dark theme

components/
├── ui/                 # shadcn/ui components
│   ├── badge.tsx
│   ├── button.tsx
│   └── card.tsx
├── sidebar.tsx         # Navigation sidebar
├── header.tsx          # Page header with wallet status
└── document-card.tsx   # Document card component

lib/
└── utils.ts            # Utility functions (date formatting, etc.)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

Dependencies are already installed in the root package.json:

```bash
# If you need to reinstall
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## 🧩 Components

### Sidebar

The main navigation sidebar with:
- PPD logo
- Navigation links (All documents, My library, Published docs)
- Active state highlighting
- Icons from lucide-react

### Header

Top header bar showing:
- Current page title
- Wallet connection status (green badge when connected)

### DocumentCard

Reusable card component for displaying documents:
- Document title
- Price in SAT
- Tags (first 3 shown, with "+N more" indicator)
- Description (truncated to 100 chars)
- "Posted X time ago" footer

**Props:**
```typescript
interface DocumentCardProps {
  id: string;
  title: string;
  cost: number;
  description?: string;
  tags?: Array<{ id: string; name: string }>;
  created_at: string;
}
```

## 📄 Pages

### Home (/) - All Documents

Displays all available documents in a grid layout.

**Features:**
- Fetches from `/api/documents`
- Responsive grid (1/2/3 columns)
- Loading state
- Empty state
- Error handling

### Library (/library) - My Library

Shows documents the user has purchased.

**Features:**
- Fetches from `/api/purchases/buyer/[address]`
- Filters by connected wallet address
- Shows purchased documents only

### Published (/published) - Published Documents

Lists documents the user has uploaded.

**Features:**
- Filters documents by `address_owner`
- Upload button (to be implemented)
- Shows owned documents

## 🎨 Styling

### Tailwind Configuration

The project uses Tailwind CSS v4 with a custom dark theme configuration in `globals.css`:

```css
.dark {
  --background: 0 0% 17%;        /* Dark charcoal */
  --card: 0 0% 23%;              /* Card background */
  --primary: 45 100% 75%;        /* Yellow accent */
  --accent: 45 95% 75%;          /* Yellow for footers */
  /* ... more variables */
}
```

### Custom Utilities

```typescript
// lib/utils.ts

// Format dates (e.g., "2 days ago")
formatDate(date: string | Date): string

// Format currency (e.g., "40.93 SAT")
formatCurrency(amount: number, currency?: string): string

// Merge class names
cn(...inputs: ClassValue[]): string
```

## 🔌 API Integration

All pages fetch data from the backend API:

```typescript
// Fetch all documents
GET /api/documents

// Fetch purchased documents
GET /api/purchases/buyer/[address]

// Search documents (future)
GET /api/documents?title=...&tags=...
```

## 🚧 TODO / Future Enhancements

- [ ] Web3 wallet integration (MetaMask, WalletConnect)
- [ ] Document upload flow
- [ ] Document detail page
- [ ] Search and filter UI
- [ ] Purchase flow
- [ ] Tags management UI
- [ ] User profile page
- [ ] Loading skeletons
- [ ] Pagination
- [ ] Sorting options
- [ ] Dark/light theme toggle
- [ ] Mobile responsive improvements

## 🎯 Key Features Implemented

✅ Dark theme matching the design  
✅ Responsive sidebar navigation  
✅ Document card grid layout  
✅ Wallet connection indicator  
✅ Loading and error states  
✅ Empty states with helpful messages  
✅ TypeScript for type safety  
✅ shadcn/ui components  
✅ Utility functions for formatting  

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

## 🐛 Troubleshooting

### Styles not applying

Make sure the `className="dark"` is on the `<html>` tag in `app/layout.tsx`.

### Components not found

Run:
```bash
npm install
```

### Colors not matching design

Check `app/globals.css` and verify the HSL values in the `.dark` section match your requirements.

## 💡 Tips

1. **Adding new shadcn/ui components:**
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

2. **Customizing theme colors:**
   Edit the HSL values in `app/globals.css` under the `.dark` selector.

3. **Adding new icons:**
   Import from `lucide-react`:
   ```typescript
   import { Icon Name } from "lucide-react";
   ```

4. **Creating new pages:**
   Add a new folder in `app/` with a `page.tsx` file. The folder name becomes the route.

