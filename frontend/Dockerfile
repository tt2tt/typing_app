# Node.js 20 の Alpine イメージを digest でピン留め（Alpine 3.22.1）
FROM node:20-alpine@sha256:eabac870db94f7342d6c33560d6613f188bbcf4bbe1f4eb47d5e2a08e1a37722

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
