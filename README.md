# 📖 MangaVerse — Манга & Манхва уншдаг платформ

Сүүлийн үеийн дизайн бүхий, Vercel-д бэлэн манга/манхва уншдаг вэбсайт.
Монгол хэл дээрх UI, бүрэн админ панел, VIP chapter системтэй.

## ✨ Онцлог

- 🎨 **Сүүлийн үеийн UI/UX** — Dark mode, glass morphism, gradient accent, smooth animations
- 📚 **Манга, манхва, manhua, webtoon** төрөл бүрийн каталог
- 🔍 **Хайлт** + шүүлт (төрөл, төлөв, жанр)
- 📖 **Уншлагын горимууд** — "Long strip" (бүтэн хуудсаар scroll) ба "Single" (нэг нэгээр, arrow keys)
- 👑 **VIP систем** — түгжээтэй chapter-уудыг VIP гишүүд уншина
- 🛡️ **Админ панел** — манга нэмэх, засах, устгах, chapter удирдах, хэрэглэгч харах
- 🔐 **JWT аутентикашн** — register / login / logout, httpOnly cookies
- ⭐ **Bookmark** — дуртай мангаа хадгалах
- 📱 **Responsive** — гар утас, таблет, компьютер дээр ажиллана

## 🚀 Vercel-д deploy хийх

1. **GitHub-д push**:
   ```bash
   git init && git add . && git commit -m "init"
   git remote add origin <your-repo>
   git push -u origin main
   ```

2. **[Vercel](https://vercel.com/new)** дээр import дарна.

3. **Environment Variables** (Settings → Environment Variables):
   ```
   AUTH_SECRET = <32-тэмдэгтлүүрийн санамсаргүй string>
   BLOB_READ_WRITE_TOKEN = (Vercel Blob Storage-с)
   KV_REST_API_URL, KV_REST_API_TOKEN = (Vercel KV-с, optional)
   ```

4. **Deploy** → бэлэн!

> Анхаар: анхны deploy-д in-memory data ашиглана (demo-г шууд ажиллуулна). Бодит production-д Vercel KV холбож, өгөгдлийг тогтмол хадгална.

## 🛠️ Local development

```bash
npm install
npm run dev
```

http://localhost:3000 нээ.

**Demo эрхүүд**:

| Эрх | Имэйл | Нууц үг | Тайлбар |
|---|---|---|---|
| Admin | admin@mangaverse.mn | `admin123` | Бүх эрхтэй |
| VIP | vip@mangaverse.mn | `vip123` | VIP гишүүн |
| User | reader@mangaverse.mn | `reader123` | Энгийн хэрэглэгч |

## 🏗️ Технологи

- **Next.js 14** (App Router, Server Actions, RSC)
- **TypeScript** strict mode
- **Tailwind CSS** (custom dark theme)
- **Framer Motion** animations (бэлэн)
- **Zustand** (бэлэн)
- **lucide-react** icons
- **bcryptjs** + **jose** (auth)
- **Vercel KV** + **Vercel Blob** (storage, optional)

## 📁 Бүтэц

```
src/
├── app/
│   ├── (routes) — нүүр, browse, manga/[slug], read/[slug]/[chapter]
│   ├── login, register, profile, vip, admin, about
│   ├── actions/ — auth, admin, bookmark server actions
│   └── layout.tsx, globals.css
├── components/ — Header, Footer, MangaCard, Reader, admin forms...
├── lib/ — db.ts (in-memory/KV), auth.ts (JWT), types.ts, seed.ts
└── middleware.ts — auto-seed
```

## 🔧 Өргөтгөх

Production-д солих зүйлс:
- `src/lib/db.ts` — in-memory Map-ийг Vercel KV-ээр солих (хэдэн мөр)
- `src/lib/auth.ts` — `AUTH_SECRET`-ийг бодит secret-ээр солих
- Админ password-ыг анхны deploy-ын дараа солих
- Vercel Blob ашиглаж зураг upload хийх (одоо URL оруулж байгаа)

## License

MIT
