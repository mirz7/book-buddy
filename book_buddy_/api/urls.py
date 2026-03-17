from django.urls import path
from . import views

urlpatterns = [
    path('books/', views.book_list_create, name='book-list-create'),
]
