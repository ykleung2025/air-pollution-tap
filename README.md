# 清新空氣小偵探

適合小學（約小二至小高）的靜態網頁遊戲。場景是學校旁邊的街道：污染行為和環保行為會從工廠、馬路和公園走出來，一開始就有圖和名稱。

- 限時 **60 秒**，生命值 **5 粒心心**。
- 點中污染行為：＋1 分，並閱讀對動植物和生態的危害。
- 污染行為停留 **8 秒**仍未點中：扣 1 心。心心用完會提早結束。
- 點中對應的環保行為：不加分、不扣分，回復 1 心（最多 5 心），並閱讀它怎樣改善環境。
- 時間到或心心用完後，會顯示得分和複習頁。

不需要安裝程式，也不需要 API 金鑰。

## 本機開啟

用瀏覽器打開專案裡的 `index.html`。

## 課堂網址（GitHub Pages）

合併到 `main` 之後，遊戲會發佈在：

https://ykleung2025.github.io/air-pollution-tap/

第一次請到倉庫的 **Settings → Pages → Build and deployment**，選擇 **Deploy from a branch**，Branch 選 **main**，Folder 選 **/ (root)**，然後按 Save。

倉庫已包含 `.nojekyll`，讓 GitHub Pages 直接提供這些靜態檔案。
