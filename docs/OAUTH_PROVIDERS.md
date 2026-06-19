# GitHub / Microsoft ログインの設定

Client ID と Client Secret は **Firebase Console にだけ** 入力します。Vercel の環境変数や `.env` には不要です。

共通のコールバック URL（GitHub・Microsoft 両方で使う）:

```
https://puffy-dc442.firebaseapp.com/__/auth/handler
```

---

## GitHub

### 1. GitHub で OAuth アプリを作成

1. [GitHub Developer Settings](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. 入力例:
   - **Application name**: `Puffy`
   - **Homepage URL**: Vercel の本番 URL（例: `https://your-app.vercel.app`）
   - **Authorization callback URL**: `https://puffy-dc442.firebaseapp.com/__/auth/handler`
3. **Register application** をクリック
4. **Client ID** をコピー
5. **Generate a new client secret** → **Client Secret** をコピー（再表示不可なので控える）

### 2. Firebase Console に登録

1. [Authentication → Sign-in method → GitHub](https://console.firebase.google.com/project/puffy-dc442/authentication/providers)
2. **有効にする** を ON
3. **クライアント ID** と **クライアント シークレット** を貼り付け
4. **保存**

---

## Microsoft

### 1. Firebase で Microsoft を有効化

1. [Authentication → Sign-in method](https://console.firebase.google.com/project/puffy-dc442/authentication/providers)
2. **Microsoft** を選択 → **有効にする**

### 2. Azure でアプリ登録（Firebase が案内する場合）

Firebase 画面に表示される手順に従うか、[Azure Portal](https://portal.azure.com/) で:

1. **Microsoft Entra ID** → **アプリの登録** → **新規登録**
2. 名前: `Puffy`
3. リダイレクト URI: **Web** → `https://puffy-dc442.firebaseapp.com/__/auth/handler`
4. 登録後、**アプリケーション (クライアント) ID** をコピー
5. **証明書とシークレット** → **新しいクライアント シークレット** を作成してコピー

### 3. Firebase Console に登録

1. Microsoft プロバイダ設定画面に戻る
2. **アプリケーション ID** と **アプリケーション シークレット** を貼り付け
3. **保存**

---

## 確認

1. Vercel の本番 URL でログイン画面を開く
2. **GitHub** / **Microsoft** ボタンが表示される
3. 各ボタンでログインできる

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| `auth/unauthorized-domain` | Firebase の承認済みドメインに Vercel URL を追加 |
| GitHub で redirect_uri エラー | コールバック URL が完全一致しているか確認 |
| Microsoft でログイン失敗 | Azure のリダイレクト URI と Firebase の設定を再確認 |
