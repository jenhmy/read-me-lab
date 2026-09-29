/* Sample document loaded by the info button, stored as a string and imported as Markdown. */
const PLANTILLA_MD = `# Welcome to ReadMeLab ✨

ReadMeLab is a visual text editor that turns your formatting into Markdown, ready to paste into any GitHub README. No Markdown syntax needed: just write, click the buttons above, and copy the result on the right.

What follows is one example of everything the editor can do.

# H1

## H2

### H3

#### H4

##### H5

###### H6

---

**bold**, *italic*, ~~strikethrough,~~ \`inline code\` X<sub>2</sub> X<sup>2</sup>

---

- First item of an unordered List
- Second item
  - Nested item, with Tab
  - Another nested item
- You can unindent with Shift+Tab

1. First item of ordered List
   1. Nested item, with Tab
2. You can unindent with Shift+Tab

---

- [ ] Task 1
- [ ] Task 2
- [x] Task 3
- [x] Task 4

> Quote Level 1
>
> > Quote Level 2
>
> Press ❝+ to add a level and ❝− to remove one.

Separator:

---

<div align="center">

| Table | Works on GitHub | Notes |
| --- | --- | ---: |
| Centred on the page | ✅ Yes |  |
| Column alignment | ✅ Yes | Left, centre, right |
| Merged cells | ❌ No | Not supported |
|  |  | Press Tab in the last cell<br>to add a new row. |

</div>

<details>
<summary>🔽 Collapsible section</summary>

Content.

</details>

---

This line is left aligned, which is what you get by default.

<div align="center">

This line is centred.

</div>

<div align="right">

This line is right aligned.

</div>

---

A [link](https://github.com), and a table of contents built from the headings above:

- [H1](#h1)
- [H2](#h2)
- [H3](#h3)

---

🚀 ✨ 🔥 💡 ✅ 🛠️ 📦 🌐 ♥︎ ✮ ➜ ✓ ✗ ⌫ ½ ♪ ╰(◕‿◕)╯

<div align="center">

In the Media tab, you can add images and align them. You can also create galleries.

</div>

![A placeholder landscape photo](https://picsum.photos/600/200?grayscale)

<div align="center">

![The same photo, centred](https://picsum.photos/300/150?blur=1)

</div>

<div align="center">

<img src="https://picsum.photos/200/150?1" alt="Photo 1" width="32%"><img src="https://picsum.photos/200/150?2" alt="Photo 2" width="32%"><img src="https://picsum.photos/200/150?3" alt="Photo 3" width="32%">

</div>

---

<div align="center">

![Onlylabel](https://img.shields.io/badge/Onlylabel-1f2937?style=for-the-badge&logo=javascript&logoColor=facc15) ![Badge](https://img.shields.io/badge/Badge-Big-1d4ed8?style=for-the-badge&labelColor=1e3a8a&logo=github&logoColor=ffffff) ![Badge](https://img.shields.io/badge/Badge-Small%20square-1d4ed8?style=flat-square&labelColor=24292f)![Badge](https://img.shields.io/badge/Badge-Small%20rounded-ffffff?style=flat&labelColor=000000)[![Badge](https://img.shields.io/badge/Badge-Clickable-0ea5e9?style=plastic&labelColor=1d4ed8)](https://shields.io/)

</div>

<div align="center">

![Progress 60%](https://geps.dev/progress/60?barColor=1d4ed8) ![Progress bar 90%](https://geps.dev/progress/90?barColor=6d28d9&label=Progress%20bar)

</div>

<div align="center">

![Tech icons](https://skillicons.dev/icons?i=js%2Cts%2Creact%2Ccss%2Chtml%2Cgit&theme=dark)

</div>

<div align="center">

![QR code for github.com/octocat](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https%3A%2F%2Fgithub.com%2Foctocat)

</div>

---

<div align="center">

![Hello World](https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,100:38bdf8&height=220&section=header&text=Hello%20World&fontSize=40&fontColor=ffffff&desc=&descSize=16)

</div>

<div align="center">

![Typing animation](https://readme-typing-svg.herokuapp.com?font=JetBrains+Mono&size=22&pause=1000&color=0ea5e9&center=true&vCenter=true&width=600&lines=Hello%20World)

</div>

---

<div align="center">

![Profile views](https://visitor-badge.laobi.icu/badge?page_id=octocat.octocat&left_text=Profile%20views&left_color=24292f&right_color=6366f1&radius=6)

</div>

<div align="center">

![GitHub activity graph](https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=octocat&theme=github_dark)

</div>

<div align="center">

![Commit streak](https://streak-stats.demolab.com?user=octocat&theme=tokyonight&hide_border=true)

</div>

---
`;
