# Node.js 20のAlpineイメージを使用
FROM node:20-alpine

# 作業ディレクトリを/appに設定
WORKDIR /app

# 依存関係ファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install --frozen-lockfile

# アプリケーションコードを全てコピー
COPY . .

# ログディレクトリを作成
RUN mkdir -p /app/log

# ポート3000を公開
EXPOSE 3000

# アプリケーションを起動
CMD [ "sh", "-c", "if [ \"$NODE_ENV\" = 'production' ]; then npm run build && npm start; else npm run dev; fi" ]
