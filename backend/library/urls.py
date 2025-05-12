from django.urls import path
from . import views

urlpatterns = [
    path('books/', views.BookList.as_view(), name='book-list'),
    path('books/<int:pk>/', views.BookDetail.as_view(), name='book-detail'),
    path('books/<int:pk>/borrow/', views.BorrowBook.as_view(), name='borrow-book'),
    path('books/<int:pk>/return/', views.ReturnBook.as_view(), name='return-book'),
    path('users/me/books/', views.UserBorrowedBooks.as_view(), name='user-borrowed'),
    path('users/register/', views.UserCreate.as_view(), name='user-create'),
]