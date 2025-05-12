from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, BorrowViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'borrow', BorrowViewSet, basename='borrow')

urlpatterns = [
    path('', include(router.urls)),
]