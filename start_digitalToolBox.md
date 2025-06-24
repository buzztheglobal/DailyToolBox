# checklist for environment#
---------------------------
PS C:\Users\gupta\Documents\DailyToolbox> python --version
Python 3.13.4
PS C:\Users\gupta\Documents\DailyToolbox> node --version
v20.19.2
PS C:\Users\gupta\Documents\DailyToolbox> npm --version
10.8.2

# run backend Server #
# git REPO #
git hub Repo:  https://github.com/buzztheglobal/DailyToolbox
# #
-------------------
##Create a Virtual Environment#
# Navigate to the backend directory
PS C:\Users\gupta\Documents\DailyToolbox> cd backend
# Create a virtual environment named 'venv'
PS C:\Users\gupta\Documents\DailyToolbox\backend> python -m venv venv
# Activate the virtual environment on Windows
PS C:\Users\gupta\Documents\DailyToolbox\backend> .\venv\Scripts\activate
#
PS C:\Users\gupta\Documents\DailyToolbox\backend> python manage.py makemigrations core
#
(venv) PS C:\Users\gupta\Documents\DailyToolbox\backend> python manage.py migrate
# #
(venv) PS C:\Users\gupta\Documents\DailyToolbox\backend> python manage.py runserver
# #
--http://127.0.0.1:8000/api/health-check/

python manage.py runserver
#
Username (leave blank to use 'gupta'): vgupta
Email address: buzz.theglobal@gmail.com
Password: MG#Jun!25
Password (again):MG#Jun!25
#

# run front Server #
# #open New Terminal #
PS C:\Users\gupta\Documents\DailyToolbox> cd .\frontend\

PS C:\Users\gupta\Documents\DailyToolbox\frontend> npm run dev

http://localhost:5173/

# git commands # https://github.com/buzztheglobal/YourDailyToolBox
git add .
git commit -m "dependencies installed"
git push origin main

git remote add origin https://github.com/buzztheglobal/DailyToolBox

Phase 1: https://g.co/gemini/share/aa37a0914942


# installs #
pip install django
pip install firebase-admin

 pip install djangorestframework
  pip install django-cors-headers
  pip install psycopg2-binary