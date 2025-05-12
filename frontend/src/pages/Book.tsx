import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useParams, useNavigate, Link } from "react-router-dom";

const exampleBook = {
  title: "Example Book",
  author: "John Doe",
  genre: "Fiction",
  publication_year: 2021,
  isbn: "1234567890",
  description: "This is an example book description.",
  available_copies: 5,
  total_copies: 10,
  borrowed_by_current_user: false,
};

export default function BookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  interface Book {
    title: string;
    author: string;
    genre: string;
    publication_year: number;
    isbn: string;
    description?: string;
    available_copies: number;
    total_copies: number;
    borrowed_by_current_user: boolean;
  }

  const [book, setBook] = useState<Book | null>(exampleBook);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userHasBorrowed, setUserHasBorrowed] = useState(false);

    useEffect(() => {
      const fetchBook = async () => {
        try {
          const response = await fetch(`/api/books/${id}`);
          const data = await response.json();
          setBook(data);
          // Check if current user has borrowed this book
          setUserHasBorrowed(data.borrowed_by_current_user);
        } catch (error) {
          console.error("Failed to fetch book:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    }, [id]);

  const handleBorrowReturn = async () => {
    setActionLoading(true);
    try {
      const endpoint = userHasBorrowed ? "return" : "borrow";
      const response = await fetch(`/api/books/${id}/${endpoint}`, {
        method: "POST",
      });

      if (response.ok) {
        navigate(0);
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!book) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>Book not found</AlertDescription>
        </Alert>
        <Link
          to="/"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to search
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{book.title}</CardTitle>
          <div className="flex gap-2 items-center">
            <Badge
              variant={book.available_copies > 0 ? "default" : "destructive"}
            >
              {book.available_copies > 0 ? "Available" : "Checked Out"}
            </Badge>
            <span className="text-sm text-gray-600">
              {book.available_copies} of {book.total_copies} copies available
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Author</h3>
              <p>{book.author}</p>
            </div>
            <div>
              <h3 className="font-semibold">Genre</h3>
              <p>{book.genre}</p>
            </div>
            <div>
              <h3 className="font-semibold">Publication Year</h3>
              <p>{book.publication_year}</p>
            </div>
            <div>
              <h3 className="font-semibold">ISBN</h3>
              <p>{book.isbn}</p>
            </div>
          </div>

          {book.description && (
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-gray-700">{book.description}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            onClick={handleBorrowReturn}
            disabled={
              actionLoading || (!userHasBorrowed && book.available_copies <= 0)
            }
          >
            {actionLoading
              ? "Processing..."
              : userHasBorrowed
              ? "Return Book"
              : "Borrow Book"}
          </Button>

          <Link to="/dashboard">
            <Button variant="outline">View Your Borrowed Books</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
