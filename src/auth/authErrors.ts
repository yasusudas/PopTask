export function authErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "メールアドレスの形式が正しくありません。";
    case "auth/user-disabled":
      return "このアカウントは無効化されています。";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "メールアドレスまたはパスワードが正しくありません。";
    case "auth/email-already-in-use":
      return "このメールアドレスは既に登録されています。";
    case "auth/weak-password":
      return "パスワードは6文字以上で設定してください。";
    case "auth/too-many-requests":
      return "試行回数が多すぎます。しばらく待ってから再度お試しください。";
    case "auth/network-request-failed":
      return "ネットワークエラーが発生しました。接続を確認してください。";
    default:
      return "認証に失敗しました。時間をおいて再度お試しください。";
  }
}
