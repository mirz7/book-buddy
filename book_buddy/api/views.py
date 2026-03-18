from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Book, ReadingSession, Note, ReadingHistory
from .serializers import BookSerializer, ReadingSessionSerializer, NoteSerializer, RegisterSerializer, ReadingHistorySerializer
from . import services

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Book.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        user_books = self.get_queryset()
        total_books = user_books.count()
        completed = user_books.filter(status='completed').count()
        reading = user_books.filter(status='reading').count()
        wishlist = user_books.filter(status='wishlist').count()
        
        # Calculate completion percentage
        completion_percentage = (completed / total_books * 100) if total_books > 0 else 0
        
        return Response({
            'total_books': total_books,
            'completed': completed,
            'reading': reading,
            'wishlist': wishlist,
            'completion_percentage': completion_percentage,
        })

    @action(detail=False, methods=['post'])
    def import_isbn(self, request):
        isbn = request.data.get('isbn')
        if not isbn:
            return Response({'error': 'ISBN is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        book_data = services.fetch_book_by_isbn(isbn)
        if book_data:
            return Response(book_data, status=status.HTTP_200_OK)
        return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        recs = services.generate_recommendations(request.user)
        return Response({'recommendations': recs}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def summarize_notes(self, request, pk=None):
        book = self.get_object()
        notes = book.notes.all()
        summary = services.generate_summary(notes)
        return Response({'summary': summary}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def generate_review(self, request, pk=None):
        book = self.get_object()
        notes = book.notes.all()
        review = services.generate_review(book, notes)
        return Response({'review': review}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def predict_completion(self, request, pk=None):
        book = self.get_object()
        date_pred = services.predict_completion_date(book)
        return Response({'predicted_date': date_pred}, status=status.HTTP_200_OK)

class ReadingSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadingSession.objects.filter(book__user=self.request.user)

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(book__user=self.request.user)

class ReadingHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadingHistory.objects.filter(book__user=self.request.user)
