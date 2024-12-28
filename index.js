const path = require('path');
const serverless = require('serverless-http');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const router = express.Router();
const app = express();
const userRouter = require('./Router/userRoute');
const errorController = require('./controller/errorController');
const deTaiRouter = require('./Router/deTaiRoute');
const doAnRouter = require('./Router/doAnRoute');
const sinhVienRouter = require('./Router/sinhVienRouter');
const tieuChiRouter = require('./Router/tieuChiRoute');
const bieuMauChungRouter = require('./Router/bieuMauChungRouter');
const { default: diemDanhRouter } = require('./Router/diemDanhRouter');
const chatRouter = require('./Router/ChatRouter');
const thongBaoRouter = require('./Router/thongBaoRouter');
const lichHopRouter = require('./Router/LichHopRouter');
const thucTapRouter = require('./Router/ThucTapRouter');
const dashboardRouter = require('./Router/DashboardRoute');
const caiDatRouter = require('./Router/caiDatRouter');
const hoiDongRouter = require('./Router/hoiDongRoute');

// app.use(express.static(${__dirname}/public));
app.use(express.static(path.join(__dirname, '/public')));
app.use(helmet());

app.use(express.json({ limit: '15kb' })); // cho phép dư liệu gửi đên không quá 15kb
const limiter = rateLimit({
  max: 1000, // giới hạn mỗi IP 100 yêu cầu theo windowMS
  windowMs: 60 * 60 * 1000, // trong 60 phút
  message: 'Too many request. Please try again in an hour.',
});
app.use(cookieParser());

// Or specify the allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://main--khoaluantotnghiep.netlify.app',
  'https://khoaluantotnghiep.netlify.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Check if the request's origin is allowed
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin); // Allow the origin
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Enable cookies and credentials to be sent
  }),
);

app.use(express.json({ limit: '15kb' }));

app.use('/api', limiter);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(mongoSanitize());
app.use(xss());

app.use(
  hpp({
    whitelist: ['name', 'maSo', 'password', 'doAn'],
  }),
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/public', express.static(path.join(__dirname, '/public')));
// use Router
router.get('/', (req, res) => {
  res.send('App is running..');
});
app.use('/api/user', userRouter);
app.use('/api/deTai', deTaiRouter);
app.use('/api/doAn', doAnRouter);
app.use('/api/thucTap', thucTapRouter);
app.use('/api/sinhVien', sinhVienRouter);
app.use('/api/tieuChi', tieuChiRouter);
app.use('/api/bieuMauChung', bieuMauChungRouter);
app.use('/api/maDiemDanh', diemDanhRouter);
app.use('/api/chat', chatRouter);
app.use('/api/thongBao', thongBaoRouter);
app.use('/api/lichHop', lichHopRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/caiDat', caiDatRouter);
app.use('/api/hoiDong', hoiDongRouter);

app.use(errorController);
app.use('/.netlify/functions/app', router);
module.exports.handler = serverless(app);
