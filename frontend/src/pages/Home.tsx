"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("title");
  interface Book {
    id: string;
    title: string;
    author: string;
    available_copies: number;
  }

  const [books, setBooks] = useState<Book[]>([
    {
      id: "1",
      title: "Sample Book 1",
      author: "Author 1",
      available_copies: 5,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Replace with actual API call to your server
      const response = await fetch(`/api/books?${searchType}=${searchQuery}`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Library Search</h1>

      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search by ${searchType}...`}
            className="pr-24"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="absolute right-0 top-0 rounded-l-none"
              >
                {searchType.charAt(0).toUpperCase() + searchType.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSearchType("title")}>
                Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchType("author")}>
                Author
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchType("genre")}>
                Genre
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <Card key={book.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{book.title}</CardTitle>
              <CardDescription>{book.author}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <span
                className={`text-sm ${
                  book.available_copies > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {book.available_copies > 0 ? "Available" : "Checked Out"}
              </span>
              <Button variant="outline" asChild>
                <a href={`/book/${book.id}`}>View Details</a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {books.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          No books found. Try a different search.
        </div>
      )}
    </div>
  );
}
