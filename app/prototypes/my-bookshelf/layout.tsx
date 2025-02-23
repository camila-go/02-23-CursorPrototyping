import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Bookshelf - Notion-powered Reading Tracker',
  description: 'Track your reading progress and manage your book collection with Notion integration',
};

export default function BookshelfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 