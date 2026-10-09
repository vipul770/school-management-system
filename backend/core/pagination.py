from rest_framework.pagination import CursorPagination

class StandardPagination(CursorPagination):
    page_size = 25
    ordering = "-pk"
