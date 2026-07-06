# منصة طلاب كلية التجارة - شعبة حسابات
## Project Structure Spec (Frontend + Backend Ready)

---

## 1. نظرة عامة على الـ Stack

- **Frontend:** HTML, CSS, JS (Vanilla) — Static, يتقدر يترفع GitHub Pages أو أي static host
- **Backend:** Node.js (Express مثلاً) + REST API
- **Database:** (تحدد لاحقًا - MongoDB أو Firebase Firestore أو MySQL — الهيكل تحت متوافق مع أي منهم)
- **Auth:** JWT-based auth للطلاب + Admin
- **AI Integration:** endpoint منفصل بيستدعي Claude/OpenAI API من الباك اند (مش من الفرونت مباشرة عشان الـ API key متتسربش)

---

## 2. فولدر ستركتشر (Frontend)

```
/frontend
  /assets
    /images
    /icons
    /fonts
  /data
    dashboard.json    → Mock data لصفحة الداشبورد
  /css
    base.css          → reset + variables + typography
    layout.css         → grid/flex structure عام
    components.css      → cards, buttons, modals, badges
    dashboard.css
    exams.css
    concepts.css
    videos.css
    admin.css
  /js
    /api
      apiClient.js       → wrapper موحّد لكل fetch requests (base URL, headers, error handling)
      auth.api.js
      student.api.js
      subjects.api.js
      exams.api.js
      ai.api.js
    /pages
      login.page.js
      dashboard.page.js
      concepts.page.js
      videos.page.js
      exams.page.js
      admin.page.js
    /components
      navbar.js
      sidebar.js
      card.js
      examTimer.js
      progressBar.js
      aiChatWidget.js
    /utils
      storage.js         → localStorage/sessionStorage wrapper (token, user data)
      validators.js
      formatters.js       → تنسيق تواريخ، نسب مئوية، إلخ
    router.js            → لو هتعمل SPA بسيط (بدون framework)
    main.js
  /pages
    login.html
    register.html
    dashboard.html
    concepts.html
    videos.html
    exams.html
    exam-runner.html      → صفحة تنفيذ الامتحان نفسه (منفصلة عن اختيار الامتحان)
    admin/
      admin-login.html
      admin-dashboard.html
      admin-subjects.html
      admin-questions.html
      admin-videos.html
      admin-concepts.html
      admin-students.html
  index.html               → landing / redirect لصفحة اللوج ان
```

**ليه الفولدر اتقسم كده:** كل صفحة ليها JS file خاص بيها (page-level) + api layer منفصل تمامًا عن الـ UI logic. ده مهم جدًا عشان لما الباك اند يتغير أو تتغير الـ endpoints، تعدل في `/js/api` بس من غير ما تلمس منطق الصفحات.

---

## 3. الصفحات ووظيفة كل واحدة

### أ) Auth
- **login.html / register.html:** تسجيل دخول الطالب + اختيار السنة الدراسية عند التسجيل (يتخزن في الـ profile)

### ب) Dashboard (الصفحة الرئيسية بعد الدخول)
تعرض:
- نسبة تقدمه في المنهج (بناءً على السنة المختارة)
- آخر المواد اللي ذاكرها / الباقي
- الامتحانات اللي خدها ودرجاتها
- الامتحانات المتبقية
- شارت بسيط (ممكن Chart.js) لتوزيع الأداء بالمواد

### ج) Concepts & Definitions
Flow: اختيار مادة → اختيار شابتر → عرض قائمة تعريفات/مفاهيم (accordion أو cards)

### د) Videos
Flow: نفس الفكرة، لكن العرض كارت فيه:
- Thumbnail
- اسم الدكتور
- اسم الموضوع
- زرار "شاهد على يوتيوب" (يفتح tab جديد بالـ YouTube link المخزن في الداتابيز، مش هترفع فيديوهات فعلية)

### هـ) Exams
Flow: اختيار مادة → اختيار جزء (نظري/عملي) → عرض امتحان
- لازم `exam-runner.html` تبقى معزولة تمامًا (timer, submit, auto-save answers) عشان لو الطالب قفل الصفحة بالغلط ميضيعش إجاباته

### و) Admin Panel
دخول بباسورد منفصل (رول admin في نفس نظام الـ auth أو نظام منفصل تمامًا - الأفضل نفس النظام بس بـ role: "admin")
بيتحكم في: المواد، الشابترز، التعريفات، الفيديوهات، بنك الأسئلة، الطلاب، السنوات الدراسية

### ز) AI Assistant
Widget عائم (floating button) موجود في كل الصفحات الداخلية، بيفتح chat box بيتصل بـ endpoint في الباك اند (`/api/ai/ask`) وممكن ياخد context (المادة/الشابتر الحالي) عشان الشرح يبقى مرتبط بمكان الطالب.

---

## 4. Data Models (عشان الباك اند - Node.js)

```
Student {
  id, name, email, passwordHash,
  academicYear: enum [1,2,3,4],
  createdAt,
  progress: { subjectId, chaptersCompleted[], lastActivity }
}

Admin {
  id, username, passwordHash, role
}

Subject {
  id, name, academicYear, order
}

Chapter {
  id, subjectId, title, order
}

Concept {
  id, chapterId, term, definition, order
}

Video {
  id, chapterId, title, doctorName, thumbnailUrl, youtubeUrl
}

ExamSection {
  id, subjectId, type: "theoretical" | "practical",
  title  // زي "القيود" أو "الدورة المحاسبية"
}

Question {
  id, examSectionId,
  type: "mcq" | "true_false" | "written" | "practical",
  questionText, options[], correctAnswer, points
}

ExamAttempt {
  id, studentId, examSectionId,
  answers[], score, submittedAt, timeSpent
}
```

---

## 5. API Endpoints المقترحة (لـ Node.js/Express)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/admin/login

GET    /api/subjects?year=2
GET    /api/subjects/:id/chapters
GET    /api/chapters/:id/concepts
GET    /api/chapters/:id/videos

GET    /api/subjects/:id/exam-sections
GET    /api/exam-sections/:id/questions
POST   /api/exam-attempts            → submit answers
GET    /api/students/:id/attempts    → history

GET    /api/students/:id/dashboard   → aggregated stats

POST   /api/ai/ask                   → { question, context } → AI response

--- Admin ---
POST/PUT/DELETE /api/admin/subjects
POST/PUT/DELETE /api/admin/chapters
POST/PUT/DELETE /api/admin/concepts
POST/PUT/DELETE /api/admin/videos
POST/PUT/DELETE /api/admin/questions
GET  /api/admin/students
```

---

## 6. ملاحظات مهمة قبل ما تدّي الـ Spec للـ AI Agent

1. **افصل الـ API calls عن الـ UI من أول يوم** — خلي كل صفحة تنادي على functions من `/js/api/*` مش fetch مباشر جوا الصفحة. ده هيسهّل عليك جدًا لما توصل الفرونت بالباك اند الحقيقي.
2. **استخدم mock data الأول** — خلي `apiClient.js` يقدر يشتغل بـ local JSON files مؤقتًا (نفس شكل الـ response المتوقع من الباك اند)، عشان تقدر تبني وتختبر الفرونت من غير ما تستنى الباك اند يخلص.
3. **الـ Auth token** لازم يتخزن ويتبعت مع كل request من الأول (Authorization header)، حتى لو الباك اند لسه مش شغال، عشان الـ integration يبقى سلس.
4. **سمّي الـ endpoints والـ fields بنفس الأسامي في الفرونت والباك من الأول** (زي أسامي الـ models فوق) عشان تقلل الأخطاء وقت الربط.
5. **AI widget** خليه component مستقل تمامًا (`aiChatWidget.js`) يتضاف بسطر واحد في أي صفحة، مش logic متكرر في كل صفحة.

---

## 7. الخطوة الجاية

لو عايز، أقدر أجهزلك:
- Prompt جاهز تدّيه للـ AI agent يبني بيه الهيكل ده كامل خطوة بخطوة
- أو نبدأ بصفحة الـ Dashboard تحديدًا (تصميم + structure) بما إنها أعقد صفحة فيها إحصائيات
