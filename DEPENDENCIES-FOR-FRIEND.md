# Dependencies Needed on Friend's Laptop

## Required Downloads:

### 1. Git (To Clone the Repository)
- **Download:** https://git-scm.com/downloads/
- **Size:** ~50MB
- **Why:** To clone your project from GitHub/repository
- **Verify:** Open terminal and run: `git --version`

### 2. Python (To Run Local Server)
- **Download:** https://www.python.org/downloads/
- **Version:** Python 3.7 or higher
- **Size:** ~100MB
- **Why:** To host the website on localhost
- **Important:** Check "Add Python to PATH" during installation
- **Verify:** Open terminal and run: `python --version`

---

## Optional (But Recommended):

### 3. VS Code (For Viewing/Editing Code)
- **Download:** https://code.visualstudio.com/
- **Size:** ~200MB
- **Why:** Better code viewing and has "Live Server" extension
- **Extensions to install:**
  - Live Server (for auto-reload)
  - GitLens (for Git integration)

### 4. Web Browser (Already Installed)
- Chrome, Firefox, or Edge
- No download needed - already on most laptops

---

## Step-by-Step Setup on Friend's Laptop:

### Step 1: Install Git
1. Download from https://git-scm.com/downloads/
2. Run installer with default settings
3. Restart terminal/command prompt

### Step 2: Clone Your Repository
```bash
git clone <your-repository-url>
cd hashlockenvelopefinal
```

### Step 3: Install Python
1. Download from https://www.python.org/downloads/
2. **IMPORTANT:** Check "Add Python to PATH"
3. Complete installation
4. Restart terminal

### Step 4: Run the Website
```bash
python -m http.server 8000
```

### Step 5: Open Browser
Go to: **http://localhost:8000**

---

## Total Downloads Required:
- ✅ Git: ~50MB (Required)
- ✅ Python: ~100MB (Required)
- ⭕ VS Code: ~200MB (Optional)

**Total Size: ~150MB (required only)**

---

## Quick Commands Summary:

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project
cd hashlockenvelopefinal

# Start local server
python -m http.server 8000

# Open browser to:
http://localhost:8000
```

---

## Troubleshooting:

**"git is not recognized"**
- Restart terminal after installing Git
- Or reinstall Git and check PATH option

**"python is not recognized"**  
- Try: `python3 -m http.server 8000`
- Or reinstall Python with "Add to PATH" checked

**Port 8000 already in use:**
```bash
python -m http.server 8080
```
Then use: http://localhost:8080

---

## That's It!
Your friend only needs **Git** and **Python** to run your website locally.
