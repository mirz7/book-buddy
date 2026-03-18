from django.db import models
from django.contrib.auth.models import User

class Book(models.Model):
    STATUS_CHOICES = [
        ('wishlist', 'Wishlist'),
        ('reading', 'Reading'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='books')
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    genre = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='wishlist')
    isbn = models.CharField(max_length=20, blank=True, null=True)
    cover_url = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    total_pages = models.PositiveIntegerField(blank=True, null=True)
    pages_read = models.PositiveIntegerField(default=0)
    rating = models.PositiveSmallIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"

    class Meta:
        ordering = ['-created_at']

class ReadingSession(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='sessions')
    date = models.DateField(auto_now_add=True)
    pages_read = models.PositiveIntegerField()
    duration_minutes = models.PositiveIntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.book.title} on {self.date}"

class Note(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note for {self.book.title} on {self.created_at.date()}"

class ReadingHistory(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='history')
    page_number = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.book.title} reached page {self.page_number} on {self.created_at}"

    class Meta:
        ordering = ['created_at']
