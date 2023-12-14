## Running the app

1. Download the repo 下載

2. Install dependencies 裝套件

```bash
yarn install
```

3. Create a `.env.local` file and add a _valid_ Postgres URL.
To get a Postgres URL, follow the instructions [here](https://ric2k1.notion.site/Free-postgresql-tutorial-f99605d5c5104acc99b9edf9ab649199?pvs=4). 設定資料庫，可以參考所附連結

```bash
docker compose up -d
```

```bash
POSTGRES_URL="postgres://postgres:postgres@localhost:5432/twitter"
```

4. Run the migrations 連資料庫

```bash
yarn migrate
```

5. Start the app 開始跑｡:.ﾟヽ(*´∀`)ﾉﾟ.:｡

```bash
yarn dev
```

6. View data in the database 查看資料庫裡的東西

```bash
yarn drizzle-kit studio
```


## Requirements
I've already finished all the basic requirements in HW3, if I didn't miss something. But sometimes, it may lag for a while, so please wait for a moment and give the server some time to respond. Enjoy yourself and wish you have a good day! ᕕ ( ᐛ ) ᕗ

基礎要求都有完成，除非我眼睛撇掉沒看見或者它突然死掉QQ

它有些地方可能會卡一下下，給它一點點時間不要放棄它，拜託

如果開不了，麻煩再嘗試一下，我真的花很多時間寫

總之，祝你有個美好的一天！