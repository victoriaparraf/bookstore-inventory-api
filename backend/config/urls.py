from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("books.infrastructure.api.urls")),
]

handler404 = "books.infrastructure.api.exception.json_not_found_view"
handler500 = "books.infrastructure.api.exception.json_server_error_view"