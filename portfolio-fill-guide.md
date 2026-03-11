# 📝 Portfolio Content Fill-In Guide
> Everything you need to update lives in one file: `src/data/portfolio.json`
> Open it, fill in your details following this guide, save, and you're done.

---

## 📁 File Location
```
your-project/
└── src/
    └── data/
        └── portfolio.json   ← ONLY file you need to edit
```

---

## 🗂️ Full Template with Instructions

Below is the complete `portfolio.json` with every field explained.
Replace the placeholder values with your own details.

```json
{
  "name": "Aisha Khan",
  "title": "Full Stack Developer",
  "tagline": "I build things for the web.",
  "about": "I'm a developer based in Lahore with 3 years of experience building fast, scalable, and beautiful web applications. I love clean code and cinematic UI.",
  "avatar": "/assets/avatar.jpg",

  "social": {
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/in/yourprofile",
    "email": "you@example.com"
  },

  "skills": [
    { "id": 1, "name": "React" },
    { "id": 2, "name": "Node.js" },
    { "id": 3, "name": "TypeScript" },
    { "id": 4, "name": "PostgreSQL" },
    { "id": 5, "name": "Docker" },
    { "id": 6, "name": "Figma" }
  ],

  "projects": [
    {
      "id": 1,
      "title": "Project Name",
      "description": "A short 1–2 sentence description of what the project does and why it matters.",
      "tags": ["React", "Node.js", "MongoDB"],
      "link": "https://github.com/yourusername/project-repo",
      "image": "/assets/projects/project1.jpg"
    },
    {
      "id": 2,
      "title": "Another Project",
      "description": "What problem does this solve? What tech makes it interesting?",
      "tags": ["Next.js", "Tailwind", "Prisma"],
      "link": "https://yourprojectlive.com",
      "image": "/assets/projects/project2.jpg"
    }
  ],

  "experience": [
    {
      "id": 1,
      "role": "Frontend Developer",
      "company": "Company Name",
      "year": "2023 – Present",
      "desc": "Built and maintained React-based dashboards. Reduced load time by 40% through code splitting and lazy loading."
    },
    {
      "id": 2,
      "role": "Junior Developer",
      "company": "Another Company",
      "year": "2021 – 2023",
      "desc": "Worked on REST APIs using Node.js and Express. Collaborated with design team to implement pixel-perfect UIs."
    }
  ]
}
```

---

## 🔤 Field-by-Field Reference

### Personal Info

| Field | What to put | Example |
|-------|-------------|---------|
| `name` | Your full name | `"Sara Ahmed"` |
| `title` | Your job title or role | `"UI/UX Designer"` |
| `tagline` | One punchy line shown in the hero | `"Turning ideas into interfaces."` |
| `about` | 2–4 sentence bio for the About section | See template above |
| `avatar` | Path to your photo (see Images section below) | `"/assets/avatar.jpg"` |

---

### Social Links

| Field | What to put |
|-------|-------------|
| `github` | Full URL to your GitHub profile |
| `linkedin` | Full URL to your LinkedIn profile |
| `email` | Your email address (used for mailto link) |

Leave a field as `""` if you don't want it shown.

---

### Skills

Each skill is just a name. Add as many as you want.
Keep the `id` values unique and sequential.

```json
"skills": [
  { "id": 1, "name": "React" },
  { "id": 2, "name": "Python" },
  { "id": 3, "name": "AWS" }
]
```

**To add a skill:** Copy any line, increment the id, change the name.
**To remove a skill:** Delete that object. Make sure there's no trailing comma on the last item.

---

### Projects

Each project has these fields:

| Field | What to put | Notes |
|-------|-------------|-------|
| `id` | Unique number | 1, 2, 3... |
| `title` | Project name | Keep it short |
| `description` | 1–2 sentences | What it does + why it's interesting |
| `tags` | Array of tech used | `["React", "Firebase"]` |
| `link` | URL to repo or live site | GitHub or deployed link |
| `image` | Path to project screenshot | See Images section below |

**To add a project:** Copy the entire `{ ... }` block, paste after the last one (separated by a comma), update the fields.

**To remove a project:** Delete the entire `{ ... }` block for that project. Make sure the remaining items are still separated by commas correctly.

---

### Experience

| Field | What to put | Example |
|-------|-------------|---------|
| `role` | Your job title at this company | `"Backend Engineer"` |
| `company` | Company name | `"Google"` |
| `year` | Time period | `"2022 – 2024"` or `"Jan 2022 – Mar 2024"` |
| `desc` | 1–2 sentences about what you did | Focus on impact, not just duties |

Add experience items in **reverse chronological order** (latest first).

---

## 🖼️ Adding Images

### Avatar Photo
1. Put your photo in `public/assets/` (create the folder if it doesn't exist)
2. Name it `avatar.jpg` (or `avatar.png`)
3. In `portfolio.json` set: `"avatar": "/assets/avatar.jpg"`

### Project Screenshots
1. Put screenshots in `public/assets/projects/`
2. Name them clearly: `project1.jpg`, `ecommerce-app.jpg` etc.
3. In `portfolio.json` set: `"image": "/assets/projects/project1.jpg"`

**Recommended image sizes:**
- Avatar: `400 × 400px` (square)
- Project screenshots: `1200 × 700px` (16:9 ratio)

**If you don't have a project image yet:** Set `"image": ""` and the site will show a gradient placeholder automatically.

---

## ✅ JSON Rules (avoid breaking the file)

These are the most common mistakes when editing JSON manually:

**1. Strings must use double quotes**
```json
✅  "name": "Sara Ahmed"
❌  "name": 'Sara Ahmed'
```

**2. No trailing comma on the last item in an array**
```json
✅  { "id": 1, "name": "React" },
    { "id": 2, "name": "Node.js" }

❌  { "id": 1, "name": "React" },
    { "id": 2, "name": "Node.js" },   ← extra comma breaks JSON
```

**3. No comments allowed in JSON**
```json
❌  "name": "Sara"  // this is my name   ← will break the file
```

**4. Validate before saving** — paste your JSON into https://jsonlint.com to check for errors before refreshing the site.

---

## 🚀 After Updating

**For local development:**
```bash
npm run dev
```
Save the file → browser hot-reloads instantly. No restart needed.

**To deploy your changes to GitHub Pages:**
```bash
git add src/data/portfolio.json
git commit -m "Update portfolio content"
git push origin main
```
GitHub Actions will automatically build and deploy. Live in ~2 minutes.

Or deploy manually:
```bash
npm run deploy
```

---

## 🗒️ Quick Checklist

- [ ] `name`, `title`, `tagline` filled in
- [ ] `about` bio written (2–4 sentences)
- [ ] `avatar` photo added to `public/assets/` and path set
- [ ] `social` links filled (GitHub, LinkedIn, email)
- [ ] At least 4–6 `skills` added
- [ ] At least 2–3 `projects` added with descriptions and tags
- [ ] `experience` filled in reverse chronological order
- [ ] Project images added to `public/assets/projects/` (or left as `""`)
- [ ] JSON validated at jsonlint.com
- [ ] Pushed to GitHub and confirmed live site updated

---

*Edit only `src/data/portfolio.json` — everything else is handled automatically.*
