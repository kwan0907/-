# SmartBet 原版資金柱圖 + 雲端 T-5 藍色 overlay + Telegram 發圖

## 本次修改（不覆寫原版）
- 原版柱圖 app-qbank-spectrum-v8.js、原版 fromApi / score / chart 完全不改。
- 藍色六馬沿用 app-qbank-cloud-replay.js 的既有 picks(frames) 函數：只透出只讀接口；沒有改原本雲端分數計算。
- 新 app-qbank-overlay-telegram.js 在每支原版 .qLiveBar 顯示 5px 藍帽，不加入任何高度或分數 dataset；快照只讀，不重新 sort。
- 同場次、同快照比較前後原版馬序、柱高、數字與賠率應該相同。實時前後時間不同，原版數字會因更新而自然變動。
- 如原版歷史快照不足而只剩雲端四池回放圖（另一套分數），會暫時隱藏其不同計法的柱形，保留雲端藍色範圍文字提示；沒有原始快照絕不補造原版數字。
- 只在相同場次、且藍色 T-5 資料時間不晚於原版正顯示的快照，才顯示藍色 overlay。AI 綠色標籤保持原狀。

## Telegram
由 /api/telegram-send serverless function 發相；Bot Token、Chat ID 只存 server-side 環境變數，不寫入 HTML / JS。

### Vercel → smartbet-moneyflow-v1 → Settings → Environment Variables
TELEGRAM_BOT_TOKEN = 從 BotFather 得到的 token
TELEGRAM_CHAT_ID = 你的私人 chat_id / 群組 ID (-100...) / 頻道 @username
TELEGRAM_SEND_KEY = 你自行建立長而隨機的發圖密鑰（建議 32+ 字元）

設定後重新部署此版本，開 Q膽 → 即場，按「📤 傳送圖表到 TG」，第一次會提示輸入 TELEGRAM_SEND_KEY。
密鑰只存當次分頁 sessionStorage；Bot Token 不會送到瀏覽器。

### 「自動（開頁期間）」
當頁面開著、TG 已設定，按「🔔 自動」打開：雲端 T-5 六馬名單鎖定、且原版柱圖最新快照有效，於 T-5 至 T+0.5 區間嘗試每場最多一張（單一裝置）；失敗後最早 60 秒重試。多個裝置目前未有跨裝置共享去重。

注意：本版自動模式依賴 Q膽網頁保持開啟，不係瀏覽器關閉後仍然運作的全自動伺服器通知。要做到真正離線全自動，應在既有雲端每分鐘快照寫入流程加入事件觸發 + 持久化賽事去重（DB），不建議靠前端輪詢或 Vercel Hobby 每分鐘 Cron。

### 驗收清單
1. 同場次、同原版快照，開/關藍色之後所有分數、高度、排序、賠率相同。
2. 雲端 T-5 完整六馬沿用原本 picks() 計出來，不能硬編六匹號碼。
3. T-5 之前不偷看未來藍色名單。
4. 綠色 AI、白波、紅波、滑桿和 5/10/30 秒更新一律不變。
5. 未設 TG 環境變數要明確報錯，不得顯示成功；Bot Token 不曝光。
6. 只有原版柱圖完整才允許發圖，圖片馬序、原版數值、藍頂和快照時間與畫面一致。
7. iOS Safari、加入主畫面、iframe 和手機寬度需實測。

## 部署注意
2026-10-14 檢查時，Vercel 正式部署來自 CLI source，帶有 api/_auth.js 等文件，與目前 GitHub main 不完全一致。未校對差異前，唔好直接用 GitHub main 或本 branch 取代正式部署，否則可能失去新功能。此 PR 暫作安全的實作分支。
