from django.conf import settings
from django.db import models


class TypingRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="typing_records")
    cps = models.IntegerField(help_text="1秒間の入力文字数（cps）")
    accuracy = models.IntegerField(help_text="正答率(%)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user_id} cps={self.cps} acc={self.accuracy}%"
