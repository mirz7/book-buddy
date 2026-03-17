from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.forms.models import model_to_dict
import json
from .models import Book

@csrf_exempt
@require_http_methods(["GET", "POST"])
def book_list_create(request):
    if request.method == "GET":
        books = Book.objects.all()
        books_list = [model_to_dict(book) for book in books]
        return JsonResponse(books_list, safe=False)
        
    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            book = Book.objects.create(
                title=data.get('title'),
                author=data.get('author'),
                description=data.get('description', '')
            )
            return JsonResponse(model_to_dict(book), status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
