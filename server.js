const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Cấu hình các middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
  secret: 'mysecret',  // Mã bí mật cho phiên làm việc
  resave: false,
  saveUninitialized: true
}));

// Trang chính - Hiển thị form dữ liệu
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/forms/data-form.html'));
});

// Trang đăng nhập
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/forms/login.html'));
});

// Xử lý đăng nhập
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const usersPath = path.join(__dirname, 'users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user;
    res.redirect('/dashboard');
  } else {
    res.send('Tên đăng nhập hoặc mật khẩu không đúng');
  }
});

// Trang đăng ký
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/forms/register.html'));
});

// Xử lý đăng ký
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const usersPath = path.join(__dirname, 'users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  
  if (users.find(u => u.username === username)) {
    return res.send('Tên đăng nhập đã tồn tại');
  }
  
  users.push({ username, password });
  fs.writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
    if (err) {
      res.status(500).send('Lỗi khi lưu dữ liệu');
    } else {
      res.redirect('/login');
    }
  });
});

// Trang điều khiển (Dashboard)
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
  } else {
    res.redirect('/login');
  }
});

// Xử lý đăng xuất
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Không thể đăng xuất');
    } else {
      res.redirect('/login');
    }
  });
});

// Xử lý gửi dữ liệu
app.post('/submit', (req, res) => {
  const data = req.body;
  fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) {
      res.status(500).send('Lỗi khi lưu dữ liệu');
    } else {
      res.send('Dữ liệu đã được lưu');
    }
  });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
