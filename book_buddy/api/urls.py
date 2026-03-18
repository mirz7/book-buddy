from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, ReadingSessionViewSet, NoteViewSet, ReadingHistoryViewSet
from . import views

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'sessions', ReadingSessionViewSet, basename='session')
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'history', ReadingHistoryViewSet, basename='history')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]
