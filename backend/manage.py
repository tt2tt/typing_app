# Django管理コマンド用スクリプト
import os
import sys

if __name__ == "__main__":
    # 設定ファイルのパスを環境変数にセット
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    # Djangoの管理コマンドをインポート
    from django.core.management import execute_from_command_line
    # コマンドライン引数をDjangoに渡して実行
    execute_from_command_line(sys.argv)
