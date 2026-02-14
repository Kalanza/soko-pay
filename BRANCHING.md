# 🌿 GIT BRANCHING STRATEGY

## ✅ Branches Created

Three development branches have been created for parallel development:

| Branch | Developer | Focus |
|--------|-----------|-------|
| `dev1-backend` | Developer 1 | Backend API, PayHero integration, Database |
| `dev2-ai-gis` | Developer 2 | AI fraud detection, GPS verification |
| `dev3-frontend` | Developer 3 | Next.js UI, API integration, Deployment |

---

## 🚀 Quick Start for Each Developer

### **Developer 1 - Backend Lead**

```bash
# Clone and switch to your branch
git clone https://github.com/Kalanza/soko-pay.git
cd soko-pay
git checkout dev1-backend

# Start working
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Make changes, then commit
git add .
git commit -m "Dev1: Implemented PayHero STK push"
git push origin dev1-backend
```

**Your files:**
- `backend/main.py`
- `backend/database.py`
- `backend/app/models/`
- `backend/app/routes/`
- `backend/app/services/payhero.py`

---

### **Developer 2 - AI/GIS Specialist**

```bash
# Clone and switch to your branch
git clone https://github.com/Kalanza/soko-pay.git
cd soko-pay
git checkout dev2-ai-gis

# Start working
cd backend
venv\Scripts\activate
pip install -r requirements.txt

# Make changes, then commit
git add .
git commit -m "Dev2: Added Gemini AI fraud detection"
git push origin dev2-ai-gis
```

**Your files:**
- `backend/app/services/ai_fraud.py`
- `backend/app/services/gis_verification.py`
- `backend/app/utils/risk_scoring.py`
- `backend/app/routes/disputes.py`

**Note:** You'll need to pull Dev 1's changes for integration:
```bash
git pull origin dev1-backend
```

---

### **Developer 3 - Frontend Developer**

```bash
# Clone and switch to your branch
git clone https://github.com/Kalanza/soko-pay.git
cd soko-pay
git checkout dev3-frontend

# Start working
cd frontend
npm install
npm run dev

# Make changes, then commit
git add .
git commit -m "Dev3: Built seller dashboard"
git push origin dev3-frontend
```

**Your files:**
- `frontend/app/`
- `frontend/components/`
- `frontend/lib/api.ts`

---

## 🔄 Workflow During Hackathon

### **Hour 1 (0:00 - 1:00): Independent Work**

Each developer works on their own branch without conflicts.

```bash
# Work on your files
# Commit frequently
git add .
git commit -m "Descriptive message"
git push origin <your-branch>
```

---

### **Hour 2 (1:00 - 2:00): Integration Starts**

**Developer 2** needs to integrate with **Developer 1's** backend:

```bash
# On dev2-ai-gis branch
git pull origin dev1-backend

# If conflicts occur, resolve them
# Then commit
git add .
git commit -m "Dev2: Integrated AI with payment flow"
git push origin dev2-ai-gis
```

**Developer 3** needs the backend API running:

```bash
# Check Dev 1's progress
# Once backend is running, test API calls from frontend
# No need to merge yet, just point to localhost:8000
```

---

### **Hour 3 (2:00 - 3:00): Final Integration**

**Merge everything into main for deployment:**

```bash
# Developer 1 merges first (foundation)
git checkout main
git pull origin main
git merge dev1-backend
git push origin main

# Developer 2 merges next (adds AI layer)
git checkout main
git pull origin main
git merge dev2-ai-gis
# Resolve any conflicts
git push origin main

# Developer 3 merges last (UI)
git checkout main
git pull origin main
git merge dev3-frontend
# Resolve any conflicts
git push origin main

# Deploy!
vercel --prod
```

---

## 📝 Commit Message Convention

Use clear, descriptive commit messages:

```bash
# Good examples:
git commit -m "Dev1: Created database schema with orders table"
git commit -m "Dev1: Implemented PayHero STK push endpoint"
git commit -m "Dev2: Added Gemini AI fraud detection service"
git commit -m "Dev2: Implemented GPS proximity verification"
git commit -m "Dev3: Built seller dashboard with QR code generation"
git commit -m "Dev3: Added order tracking page with timeline"

# Bad examples:
git commit -m "updates"
git commit -m "fixes"
git commit -m "work in progress"
```

---

## 🆘 Handling Merge Conflicts

If you get conflicts when merging:

```bash
# 1. Git will tell you which files have conflicts
# 2. Open those files
# 3. Look for conflict markers:
#    <<<<<<< HEAD
#    Your changes
#    =======
#    Their changes
#    >>>>>>> branch-name

# 4. Edit the file to keep what you want
# 5. Remove the conflict markers
# 6. Save the file

# 7. Mark as resolved
git add <conflicted-file>
git commit -m "Resolved merge conflicts between dev1 and dev2"
git push
```

---

## 🔒 Best Practices

### ✅ DO:
- Commit frequently (every 15-30 minutes)
- Write clear commit messages
- Push your changes regularly
- Communicate with teammates about what you're working on
- Pull from other branches when you need their code

### ❌ DON'T:
- Work directly on `main` branch
- Commit broken code
- Push without testing
- Overwrite teammates' work
- Forget to pull before starting new work

---

## 📊 Branch Status Check

To see all branches:
```bash
git branch -a
```

To see your current branch:
```bash
git branch
```

To switch branches:
```bash
git checkout <branch-name>
```

To see what changed:
```bash
git status
git diff
```

---

## 🎯 Pre-Deployment Checklist

Before merging to main:

**Developer 1:**
- [ ] Backend runs without errors
- [ ] All API endpoints work
- [ ] Database schema is correct
- [ ] PayHero integration tested

**Developer 2:**
- [ ] AI fraud detection returns valid results
- [ ] GPS verification works
- [ ] No breaking changes to Dev 1's code

**Developer 3:**
- [ ] Frontend builds successfully (`npm run build`)
- [ ] All pages render correctly
- [ ] API calls connect to backend
- [ ] Mobile responsive

---

## 🚨 Emergency: Undo Last Commit

If you committed something wrong:

```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Edit files, then commit again
git add .
git commit -m "Fixed version"
git push --force origin <your-branch>
```

**Warning:** Only use `--force` on YOUR branch, never on `main`!

---

## 📞 Communication Flow

When you complete a major feature:

```bash
# 1. Commit and push
git push origin <your-branch>

# 2. Notify team
# In your WhatsApp/Slack group:
"@team Dev1: PayHero integration complete on dev1-backend branch. 
Backend running on localhost:8000. API docs at /docs"
```

---

## 🎓 Quick Git Cheat Sheet

```bash
# See current branch
git branch

# Switch branch
git checkout <branch-name>

# See status
git status

# Add files
git add .                    # Add all
git add <specific-file>      # Add specific file

# Commit
git commit -m "message"

# Push
git push origin <branch-name>

# Pull latest changes
git pull origin <branch-name>

# Pull from another branch
git pull origin <other-branch>

# See commit history
git log --oneline

# See remote branches
git branch -r

# Discard local changes
git checkout -- <file>       # Discard changes to specific file
git reset --hard             # Discard ALL local changes (careful!)
```

---

## 🏁 Final Merge & Deploy

When all developers are done:

```bash
# ONE person does this (probably Dev 1 or team lead)

# 1. Merge dev1-backend to main
git checkout main
git pull origin main
git merge dev1-backend
git push origin main

# 2. Merge dev2-ai-gis to main
git merge dev2-ai-gis
# Fix conflicts if any
git push origin main

# 3. Merge dev3-frontend to main
git merge dev3-frontend
# Fix conflicts if any
git push origin main

# 4. Deploy
cd backend
vercel --prod

cd ../frontend
vercel --prod

# 5. Test production deployment
# 6. Present to judges! 🎉
```

---

## ✅ Current Branch Status

All branches are ready and pushed to GitHub:

- ✅ `main` - Protected, stable code only
- ✅ `dev1-backend` - Backend development
- ✅ `dev2-ai-gis` - AI/GIS development
- ✅ `dev3-frontend` - Frontend development

Repository: https://github.com/Kalanza/soko-pay.git

**Each developer should clone and checkout their branch NOW!**

---

**Happy coding! 🚀**
