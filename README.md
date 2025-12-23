# Expense Sharing Application

A Splitwise-like expense sharing application built with React, TypeScript, and Supabase. This application allows users to create groups, add members, track shared expenses, and settle balances efficiently.

## Features

- **User Management**: Select from existing users to act as different participants
- **Group Creation**: Organize expenses by creating groups for specific events or ongoing shared costs
- **Member Management**: Add or remove members from groups
- **Flexible Expense Splitting**:
  - Equal splits among all members
  - Exact amount splits (each person pays a specific amount)
  - Percentage-based splits (each person pays a percentage of the total)
- **Expense Tracking**: View all expenses within a group with details on who paid and how amounts were split
- **Balance Calculation**: Automatic calculation of who owes what based on all expenses and settlements
- **Simplified Settlements**: Minimize transactions needed to settle up by showing optimized payment paths
- **Settlement Recording**: Track when payments are made between group members

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (Database and Real-time features)
- **Build Tool**: Vite
- **Package Manager**: npm

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account (for database)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-sharing-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project on [Supabase](https://supabase.io/)
2. Get your project's URL and anon key from the Supabase dashboard
3. Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. Run the SQL migration from `supabase/migrations/20251223121003_create_expense_sharing_schema.sql` in your Supabase SQL editor
2. This will create all necessary tables and set up Row Level Security policies

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── AddExpense.tsx     # Form for adding new expenses
│   ├── BalanceView.tsx    # Balance calculation and settlement view
│   ├── ExpenseList.tsx    # List of expenses in a group
│   ├── GroupDetail.tsx    # Detailed view of a group with tabs
│   ├── GroupList.tsx      # List of all groups
│   ├── ManageMembers.tsx  # Member management interface
│   └── UserSelector.tsx   # User selection dropdown
├── lib/
│   ├── database.types.ts  # TypeScript types for database schema
│   └── supabase.ts        # Supabase client configuration
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Database Schema

The application uses the following tables:

- `users`: Stores user information (id, name, email)
- `groups`: Stores group information (id, name, description)
- `group_members`: Links users to groups (many-to-many relationship)
- `expenses`: Stores expense details (id, group_id, paid_by, amount, description, split_type)
- `expense_splits`: Stores how each expense is split among members (expense_id, user_id, amount, percentage)
- `settlements`: Records when users settle their balances (group_id, from_user_id, to_user_id, amount)

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run ESLint to check for code issues
- `npm run typecheck`: Check TypeScript types

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

1. Select a user from the dropdown in the top right corner
2. Create a new group or select an existing one
3. Add members to your group
4. Start adding expenses with the desired split type
5. View balances and simplified settlements in the balances tab
6. Record settlements when payments are made

## Demo Script

For a detailed walkthrough of the application's features, see the [demo script](demo-script.md).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the backend infrastructure
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons
