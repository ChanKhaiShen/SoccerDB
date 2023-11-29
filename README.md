# SoccerDB

Below is some information about this project.

The main file is app.js. 

eventModel.js, administratorModel.js and userModel.js are for collections "events", "administrators" and "users". 

home.html, bookmark.html, admin.html and register.html are for "Home" page, "Bookmark" page, "admin" page and "register" page.

# 

Below are some side notes.

Note: In previous semester, this project is developed as coursework of 6003CEM Web API Development. In current semester, this project is analysed and modified based on coursework of 6005CEM Security.

Security features:
1) Password hashing + salt + pbkdf2
2) Simple password strength checker
3) Role-based access control of normal user and administrator
4) Attribute-based access control of normal user
5) Authentication using login (bookmark page and admin page)

#

User Note:
1) The main page is home page
2) From home page, all types of user can search soccer event, then click bookmark button
3) Then, user will be prompted for login, only normal user is allowed to use the bookmark button
4) A new normal user can be registered at register page
5) Normal user can also navigate to bookmark page to view past bookmarked soccer events (This requires login)
6) Admin can go to admin page to view the list of normal user information and remove any normal user (This requires login)
