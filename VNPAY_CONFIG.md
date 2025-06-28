# VNPay Configuration Guide

## Environment Variables Setup

Để tích hợp VNPay, bạn cần thêm các environment variables sau vào file `.env`:

```env
# VNPay Payment Configuration (Sandbox)
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:4000/payment-success
```

## Đăng ký VNPay Sandbox

1. Truy cập: http://sandbox.vnpayment.vn/devreg/
2. Đăng ký tài khoản developer
3. Nhận thông tin cấu hình qua email:
   - `vnp_TmnCode`: Mã định danh merchant
   - `vnp_HashSecret`: Khóa bí mật để tạo checksum

## Cấu hình URL

- **Payment URL**: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
- **Return URL**: URL để VNPay redirect sau khi thanh toán (frontend)
- **IPN URL**: URL để VNPay gửi notification (backend API)

## API Endpoints

### Backend (NestJS)
- `POST /payment/vnpay` - Tạo payment URL
- `GET /payment/vnpay/ipn` - IPN callback từ VNPay
- `GET /payment/vnpay/return` - Return URL handler

### Frontend (Next.js)
- `POST /api/vnpay` - Proxy endpoint
- Service: `vnpayService.ts` với RTK Query

## Test Thông tin

Sau khi đăng ký sandbox, sử dụng thông tin test mà VNPay cung cấp để thử nghiệm thanh toán.

## Production

Khi chuyển sang production:
1. Đăng ký merchant account chính thức với VNPay
2. Cập nhật `VNPAY_URL` thành URL production
3. Cập nhật `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET` production
4. Cấu hình SSL cho IPN URL 