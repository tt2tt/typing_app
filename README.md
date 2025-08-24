# アーキテクチャ図

```mermaid
graph TD


subgraph User["ユーザー"]
A1[ブラウザ]
end


subgraph Frontend["Next.js (Vercel)"]
B0["UI: サインイン・ログイン"]
B1[UI: タイピング画面]
B2[UI: 記録表示]
end


subgraph Backend["Django API"]
C1[認証・ログイン]
C2[文章取得API]
C3[記録保存API]
end


subgraph DB["MySQL / RDS"]
D1[(users)]
D2[(typing_sessions)]
end


subgraph LLM["テキスト生成"]
E1["ChatGPT API"]
E2["Ollama (ローカル/検証用)"]
end


%% フロー
A1 --> B0
A1 --> B1
A1 --> B2


B0 -->|サインイン/ログイン| C1
B1 -->|練習開始| C2
B2 -->|記録閲覧| C3


C1 --> D1
C2 --> E1
C2 --> E2
C3 --> D2


E1 --> C2
E2 --> C2