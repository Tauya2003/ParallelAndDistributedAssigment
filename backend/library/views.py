from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Book, BorrowRecord
from .serializers import BookSerializer, BorrowRecordSerializer, UserSerializer
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

class BookList(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by query params
        title = self.request.query_params.get('title')
        author = self.request.query_params.get('author')
        genre = self.request.query_params.get('genre')
        
        if title:
            queryset = queryset.filter(title__icontains=title)
        if author:
            queryset = queryset.filter(author__icontains=author)
        if genre:
            queryset = queryset.filter(genre__icontains=genre)
            
        return queryset

class BookDetail(generics.RetrieveAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

class BorrowBook(generics.CreateAPIView):
    queryset = BorrowRecord.objects.all()
    serializer_class = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        book = get_object_or_404(Book, pk=kwargs['pk'])
        
        if book.available_copies <= 0:
            return Response(
                {'error': 'No available copies'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already borrowed this book
        existing_borrow = BorrowRecord.objects.filter(
            book=book, 
            user=request.user,
            returned=False
        ).exists()
        
        if existing_borrow:
            return Response(
                {'error': 'You already borrowed this book'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create borrow record
        borrow = BorrowRecord.objects.create(
            book=book,
            user=request.user,
            due_date=timezone.now() + timedelta(days=14)
        )
        
        # Update available copies
        book.available_copies -= 1
        book.save()
        
        serializer = self.get_serializer(borrow)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReturnBook(generics.UpdateAPIView):
    queryset = BorrowRecord.objects.all()
    serializer_class = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        borrow = get_object_or_404(BorrowRecord, pk=kwargs['pk'], user=request.user)
        
        if borrow.returned:
            return Response(
                {'error': 'Book already returned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        borrow.returned = True
        borrow.save()
        
        # Update available copies
        book = borrow.book
        book.available_copies += 1
        book.save()
        
        return Response({'status': 'book returned'})

class UserBorrowedBooks(generics.ListAPIView):
    serializer_class = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BorrowRecord.objects.filter(
            user=self.request.user,
            returned=False
        ).select_related('book')

class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]