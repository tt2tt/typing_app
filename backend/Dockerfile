# Python 3.11の軽量イメージをベースにする（Digestでピン留めして再現性を確保）
FROM python:3.11-slim@sha256:9bffe4353b925a1656688797ebc68f9c525e79b1d377a764d232182a519eeec4

# 作業ディレクトリを/appに設定
WORKDIR /app

# 必要なシステムパッケージをインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Python依存パッケージをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードを全てコピー
COPY . .

# ログディレクトリを作成
RUN mkdir -p /app/log

# 8000番ポートを公開
EXPOSE 8000

# GunicornでDjangoアプリケーションを起動
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
