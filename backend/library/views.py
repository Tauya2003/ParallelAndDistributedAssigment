from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Book, BorrowRecord
from .serializers import BookSerializer, BorrowRecordSerializer
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated


class BookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        books = Book.objects.filter(
            Q(title__icontains=query) | 
            Q(author__icontains=query) | 
            Q(genre__icontains=query)
        )
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

class BorrowViewSet(viewsets.ModelViewSet):
    queryset = BorrowRecord.objects.all()
    serializer_class = BorrowRecordSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return BorrowRecord.objects.filter(user=user, return_date__isnull=True)
        return BorrowRecord.objects.none()
    
    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        record = self.get_object()
        if record.return_date is not None:
            return Response({'error': 'Book already returned'}, status=status.HTTP_400_BAD_REQUEST)
        
        record.return_date = timezone.now()
        record.book.available += 1
        record.book.save()
        record.save()
        
        return Response({'status': 'book returned'})
    
    def create(self, request):
        book_id = request.data.get('book')
        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if book.available <= 0:
            return Response({'error': 'Book not available'}, status=status.HTTP_400_BAD_REQUEST)
        
        record = BorrowRecord.objects.create(
            user=request.user,
            book=book
        )
        book.available -= 1
        book.save()
        
        serializer = self.get_serializer(record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)