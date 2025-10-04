from django.contrib import admin
from .models import TypingRecord


@admin.register(TypingRecord)
class TypingRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "cps", "accuracy", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "user__email")
