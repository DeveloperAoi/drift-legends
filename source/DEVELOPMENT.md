# DRIFT LEGENDS — 開発メモ（次のセッション向けの引き継ぎ）

公開中のゲームはリポジトリ直下の `index.html`（GitHub Pages）。このフォルダ `source/` がその元のソースコード。
**`index.html` を直接編集しないこと。** 必ず `source/src/` を編集してビルドし、出力をコピーする。

## 現在のバージョン
v3.0（`src/data.js` の `GAME_VERSION` と `CHANGELOG`）。アップデートしたら両方を更新すると、次回起動時にお知らせ画面が自動で開く。

## ビルド手順
```bash
cd source
python3 build.py        # dist/index.html を作る（claude.ai 向け・単体版）。dist/check.js は構文チェック用
node --check dist/check.js
python3 build_gh.py     # gh_out/index.html を作る（GitHub 版：Firebase シムを埋め込み）
cp gh_out/index.html ../index.html   # これをコミットして push すると公開される
```
`dist/` と `gh_out/` は作業用（コミット不要）。`../firebase-config.js` は Firebase の設定（API キーなど）で、編集しない。

## ファイル構成（src/）
build.py の `order` の順に1つの即時関数へ連結される。
- `engine.js` WebGL エンジン（GB ジオメトリビルダー、Mesh / Mat / Node、Renderer、パーティクル）。Node.rot は [ヨー, ピッチ, ロール]
- `data.js` メーカー・車（CAR_ROWS）・パーツ（PARTS / AERO）・マップ（MAPS）・ストーリー（STORY）・曲（TRACKS）・実績・エキストラ・バージョン／更新履歴
- `items.js` / `items2.js` / `items3.js` アイテム（ITEMS）・チェスト・追加の車（addCar）・ダイヤショップ・ボディキット・消費アイテム
- `content25.js` v2.5 の追加分：ドラッグストリップ／ドリフト練習場（MAPS の ctrl 指定）、新曲、ストーリー S2・S3、実績の追加、コード（REDEEM_CODES）、ガレージレベル、車ごとのヘッドライト（hlDef）
- `maps7.js` v3.0 新マップ：turtleCourse（直線/円弧の区間リスト→2本の直線長を解いてループを閉じる）で明神峠（pass）・東京メトロポリタン高速（metro）を定義。tunnels / park / gates / walls / dense / jct
- `packs.js` v2.7 カードパック演出・インベントリ・開封ログ・称号/マフラー・サーバー時刻 SRV
- `progress.js` v2.8 レベル（最大200）・XP・プロフィール・実績XP
- `events.js` v2.9 期間限定イベント（EVENTS：xmas2026 / nye2026 / ny2027）・年越し演出 NYFX
- `final.js` v3.0 最終統合：車カード（CAR_CARDS、type 'carcard'）と新車 hk_van（carmodel の 'van' ボディ）、リザルト仕上げ（_runId で二重受取防止）、下部ナビ #bnav、メニューBGM（music/ の menu*.mp3）、スマホ標準レイアウト C、開発者パネル r_devPanel・告知/メンテ ADM（Firebase admin/*）
- `v31.js` プロフィール（d.prof：icon/frame/effect/banner/bio）・プロフィール用アイテム78種・専用パック（carpack/profpack）・限定車（戦車/フォーミュラ/ブロックの車）
- `v32.js` 軽トラ＋フルチューン版・フルチューンチケット（d.tickets）・ストーリーのレース中セリフ（TALK）・湾岸風の車選択・エンジン音の強化（排気共鳴）
- `physics.js` 車の物理・スペック計算（computeSpec、defaultLook、defaultTune）
- `track.js` コース生成（def.ctrl があればその制御点を使う）と景観
- `carmodel.js` 車の3Dモデル（BODY_TYPES の形状プロファイル、エアロ、ライト、運転席、バス／そり専用モデル）
- `icons.js` オリジナル SVG アイコン（ICO）、`meters.js` スピードメーター
- `audio.js` 効果音・エンジン音（ENGINE_PROFILES）・手続き生成の音楽
- `net.js` オンライン対戦、`game.js` レース本体（モード：story / event / time / touge / free / online / drag）
- `ui.js` 画面全般（SAVE、メニュー、各画面 r_xxx、ボタン動作 a_xxx、リザルト showResults、購入プレビュー・購入確定）
- `ui25.js` v2.5 の画面：ストーリー（シーズン）・ドラッグ・実績・コード・ガレージレベル・チュートリアル・フレンド・クラン／チャット・トレード（SOC オブジェクト）
- `i18n_dict.js`（自動生成：`i18n/en.json` から）・`i18n.js` 英語表示。日本語の断片を辞書で置き換える方式
- `fbshim.js` GitHub 版のみ：Firebase で claude.use('room' | 'db' | 'user') を再現、ランキング、ユーザーネーム
- `shell.html` HTML の骨組み、`style.css` スタイル

## 英語翻訳の追加
新しい日本語テキストを足したら、`i18n/en.json` に「日本語の断片 → 英語」を追加し、`src/i18n_dict.js` を再生成する：
```python
import json; en=json.load(open('i18n/en.json'))
d=open('src/i18n_dict.js').read(); head=d[:d.index('const I18N_EN = ')]
open('src/i18n_dict.js','w').write(head+'const I18N_EN = '+json.dumps(en,ensure_ascii=False)+';\n')
```
画面上の文字は「日本語の連続部分」ごとに分割して訳される（数字や英字で区切られる）。アイテム・消費アイテム・ボディキットは `en` フィールドがあれば自動で辞書に入る。

## Firebase（GitHub 版のオンライン機能）
- プロジェクト：drift-legends-e9ca2（Realtime Database）。設定はリポジトリ直下の `firebase-config.js`
- 使うパス：users / rooms / stats / online / profiles / unames / lb / friends / freq / ftask / clans / clanNames / clanCodes / clanOf / clanChat / trades / tradeInv / codes
- ルールは `firebase-rules.json`。新しいパスを使う機能を足したらルールも更新し、オーナーに Firebase コンソールでの貼り付けをお願いする
- 開発者（オーナー）判定：firebase-config.js の ownerUids / ownerEmailSha256

## テスト
`test/` に Playwright のテストスクリプトがある（headless Chrome + swiftshader。動作はかなり遅い）。
- `flow.py` 基本の流れ（購入・チューニング・ストーリー・イベント）
- `v22parts.py` 全エアロパーツを全車で生成してエラーが出ないか
- `v23ui.py` 購入プレビュー・購入確定・エキストラ2枠
- `v25.py` / `v25b.py` / `v25en.py` v2.5 の画面・ドラッグ・英語表示
- `social.py` フレンド・クラン・チャット・トレードを2人で（`test/fbmock/mock2.js` の模擬 Firebase を使用）
テストを動かすときは、初回のチュートリアル表示を `SAVE.data.tutDone = true` と `UI.closeModal()` で閉じること。
スクリプト内のパス（/home/claude/dl など）は環境に合わせて直す。

## 注意点
- 既存のセーブデータとの互換性を保つ（SAVE のデフォルト値は読み込み時にマージされる。新しい項目は `d.xxx = d.xxx || {}` のように扱う）
- AudioSys などクラス内のメソッドの後ろにカンマを付けない
- 運転席視点のカメラの near は 0.2（小さくすると画面が真っ黒になる環境がある）
- 実在のメーカー名・車名は使わない（架空の名前にする）
- `ads/` は過去に作った広告（HTML アニメーション）


## v2.6〜v3.0 の補足
- テスト用フック：`window.__DL`（game, UI, SAVE, MAPS, getTrack, Track ...）と `window.__DLX`（SRV, EVENTS, ADM, DEV, carCards ...）。テストは `test/*.py`（Playwright）。
- 音楽ファイル：`../music/` と `music/playlist.json`。ChristmasNight.mp3 はクリスマスイベント専用、`menu` で始まるファイルはメインメニュー用、それ以外は通常レースのランダム再生。
- 管理機能：Firebase の `admin/announce|maint|reset|update|log`。書き込みはルールで開発者UID（または `admins/{uid}=true`）だけ。サーバー再起動はこの構成では存在しない（メンテナンスモード＋カウントダウンで代替）。
- `game.start(cfg)` の `cfg.startProg` で開始位置を指定できる（テスト・スクリーンショット用）。
- メールアドレスはリポジトリに絶対に書かない（firebase-config の SHA-256 ハッシュか UID のみ）。
