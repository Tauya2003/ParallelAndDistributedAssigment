"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const exampleBooks = [
  {
    id: "1",
    title: "Example Book 1",
    author: "John Doe",
    borrow_date: "2023-10-01",
    due_date: "2023-10-15",
  },
  {
    id: "2",
    title: "Example Book 2",
    author: "Jane Smith",
    borrow_date: "2023-10-05",
    due_date: "2023-10-20",
  },
];

export default function Dashboard() {
  interface BorrowedBook {
    id: string;
    title: string;
    author: string;
    borrow_date: string;
    due_date: string;
  }

  const [borrowedBooks, setBorrowedBooks] =
    useState<BorrowedBook[]>(exampleBooks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        const response = await fetch("/api/users/me/books");
        if (!response.ok) throw new Error("Failed to fetch borrowed books");
        const data = await response.json();
        setBorrowedBooks(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBorrowedBooks();
  }, []);

  const handleReturn = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/return`, {
        method: "POST",
      });

      if (response.ok) {
        // Optimistically update UI
        setBorrowedBooks((prev) => prev.filter((book) => book.id !== bookId));
      }
    } catch (err) {
      setError("Return failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Dashboard</CardTitle>
          </CardHeader>
          <CardContent>Loading your borrowed books...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Borrowed Books</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="flex items-center">
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {borrowedBooks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                You haven't borrowed any books yet.
              </p>
              <Link to="/">
                <Button>Browse Books</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Borrowed Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowedBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">
                      <Link to={`/book/${book.id}`} className="hover:underline">
                        {book.title}
                      </Link>
                    </TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      {format(new Date(book.borrow_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(book.due_date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturn(book.id)}
                      >
                        Return
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
